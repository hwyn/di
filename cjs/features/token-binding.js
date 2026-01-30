"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.Token = Token;
exports.MultiToken = MultiToken;
var tslib_1 = require("tslib");
/**
 * @file token-binding.ts
 * @description Dependency Injection Token Binding System
 *
 * Manages the registration and resolution strategies for DI Tokens.
 * Implements a "Smart Factory" pattern that:
 * 1. Supports both Single and Multi-provider bindings
 * 2. Handles Scope-based filtering (Root vs Component scopes)
 * 3. Adapts to Sync and Async resolution modes automatically
 * 4. Provides high-performance lookups using WeakMaps and closure caching
 */
var metadata_1 = require("../metadata");
var registry_1 = require("../registry");
var common_1 = require("../common");
var resolution_1 = require("../resolution");
var TOKEN_BINDING_STATE = new WeakMap();
var FactoryBuilder = {
    create: function (token) {
        var _this = this;
        var state = TOKEN_BINDING_STATE.get(token);
        var isMulti = state.mode === 'multi';
        return function (injector, mode) {
            var currentScope = injector.get(registry_1.INJECTOR_SCOPE, metadata_1.InjectFlags.Optional) || metadata_1.ROOT_SCOPE;
            var providers = _this.fastFilterProviders(state.registry, currentScope);
            if (mode === metadata_1.ResolveMode.Async) {
                return (0, resolution_1.resolveMultiAsync)(token, providers, injector).then(function (results) {
                    return isMulti ? results : results[0];
                });
            }
            var result = (0, resolution_1.resolveMulti)(token, providers, injector);
            if (result && typeof result.then === 'function') {
                return result.then(function (arr) { return isMulti ? arr : arr[0]; });
            }
            return isMulti ? result : result[0];
        };
    },
    fastFilterProviders: function (registrySet, scope) {
        var e_1, _a;
        var results = [];
        try {
            for (var registrySet_1 = tslib_1.__values(registrySet), registrySet_1_1 = registrySet_1.next(); !registrySet_1_1.done; registrySet_1_1 = registrySet_1.next()) {
                var entry = registrySet_1_1.value;
                if (entry.scope === scope) {
                    results.push(entry.provider);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (registrySet_1_1 && !registrySet_1_1.done && (_a = registrySet_1.return)) _a.call(registrySet_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return results;
    }
};
function normalizeProvider(raw) {
    var provider = typeof raw === 'function' ? { provide: raw, useClass: raw } : raw;
    if (!provider || typeof provider !== 'object' || !('provide' in provider)) {
        throw new Error("[DI Error] Invalid provider: missing 'provide' property.");
    }
    if (common_1.InstantiationPolicy.activeEnv) {
        provider.env = common_1.InstantiationPolicy.activeEnv;
    }
    return {
        token: provider.provide,
        body: provider,
        isMulti: !!provider.multi
    };
}
function setHookMetadata(token, updates) {
    var existing = registry_1.HookMetadata.get(token);
    if (existing) {
        Object.assign(existing, updates);
    }
    else {
        registry_1.HookMetadata.hook(token, updates);
    }
}
function installTokenHooks(token, isDecorator) {
    setHookMetadata(token, {
        onScopeCheck: function (_def, scope) {
            var e_2, _a;
            var state = TOKEN_BINDING_STATE.get(token);
            if (!state)
                return false;
            try {
                for (var _b = tslib_1.__values(state.registry), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var entry = _c.value;
                    if (entry.scope === scope)
                        return true;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return false;
        },
        onAllow: function (_token, provider) {
            var _a;
            if (provider && isDecorator) {
                var name = token.name || token.toString();
                (_a = common_1.InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn("[DI Warning] \u26A0\uFE0F Explicit provider overrides implicit @Token binding: ".concat(name));
            }
            return true;
        }
    });
}
// Register debug tools
common_1.InstantiationPolicy.registerDebugTools({
    inspectToken: function (token) {
        var state = TOKEN_BINDING_STATE.get(token);
        if (!state)
            return null;
        return {
            mode: state.mode,
            providerCount: state.registry.size,
            scopes: Array.from(state.registry).map(function (entry) { return entry.scope; }),
            isBound: true
        };
    },
    resetToken: function (token) {
        TOKEN_BINDING_STATE.delete(token);
    }
});
function register(input, scope, isDecorator) {
    if (scope === void 0) { scope = metadata_1.ROOT_SCOPE; }
    if (isDecorator === void 0) { isDecorator = false; }
    var providers = Array.isArray(input) ? input : [input];
    (0, common_1.deepForEach)(providers, function (raw) {
        var _a;
        var _b = normalizeProvider(raw), token = _b.token, body = _b.body, isMulti = _b.isMulti;
        if (!TOKEN_BINDING_STATE.has(token)) {
            TOKEN_BINDING_STATE.set(token, {
                mode: isMulti ? 'multi' : 'single',
                registry: new Set()
            });
            var def = (0, metadata_1.getInjectableDef)(token);
            if (!def) {
                (0, metadata_1.setInjectableDef)(token, { scope: scope });
                def = (0, metadata_1.getInjectableDef)(token);
            }
            if (def) {
                def.factory = FactoryBuilder.create(token);
                installTokenHooks(token, isDecorator);
            }
        }
        var state = TOKEN_BINDING_STATE.get(token);
        var existingMode = state.mode;
        if (isMulti && existingMode !== 'multi') {
            throw new Error("[DI Error] Token '".concat(token, "' is Single, cannot add Multi provider."));
        }
        if (!isMulti && existingMode === 'multi') {
            throw new Error("[DI Error] Token '".concat(token, "' is Multi, cannot add Single provider."));
        }
        if (existingMode === 'single') {
            if (state.registry.size > 0 && isDecorator) {
                (_a = common_1.InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn("[DI Warning] Token '".concat(token, "' binding overwritten by new decorator."));
            }
            state.registry.clear();
        }
        state.registry.add({ provider: body, scope: scope });
    });
}
function validateBinding(target, scope, token) {
    var _a, _b;
    var def = (0, metadata_1.getInjectableDef)(target);
    if (!def) {
        (_a = common_1.InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn("[DI Warning] Missing @Injectable decorator for '".concat(target.name, "' (Token: ").concat(String(token), "). Check decorator order."));
    }
    else if (def.scope && def.scope !== scope) {
        (_b = common_1.InstantiationPolicy.logger) === null || _b === void 0 ? void 0 : _b.warn("[DI Warning] Scope mismatch: '".concat(target.name, "' is '").concat(def.scope, "' but Token '").concat(String(token), "' is '").concat(scope, "'."));
    }
}
function Token(token, scope) {
    if (scope === void 0) { scope = metadata_1.ROOT_SCOPE; }
    return function (target) {
        validateBinding(target, scope, token);
        register({ provide: token, useClass: target }, scope, true);
    };
}
function MultiToken(token, scope) {
    if (scope === void 0) { scope = metadata_1.ROOT_SCOPE; }
    return function (target) {
        validateBinding(target, scope, token);
        register({ provide: token, multi: true, useClass: target }, scope);
    };
}