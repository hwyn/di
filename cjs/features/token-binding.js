"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.Token = Token;
exports.MultiToken = MultiToken;
var tslib_1 = require("tslib");
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
            if (token !== provider && isDecorator) {
                var name = (0, common_1.getSecureTokenName)(token);
                (_a = common_1.InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn("[DI Warning] \u26A0\uFE0F Explicit provider overrides implicit @Token binding: ".concat(name));
            }
            return true;
        }
    });
}
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
/**
 * Programmatically registers one or more providers into the token-binding system.
 *
 * This is the imperative counterpart to `@Token()` / `@MultiToken()` decorators.
 * Registered providers are resolved lazily when the token is first requested from
 * an injector whose scope matches.
 *
 * @param input - A provider or array of providers to register.
 * @param scope - Scope for the registration (defaults to `'root'`).
 * @param isDecorator - @internal Whether this call originates from a decorator (affects warnings).
 *
 * @example
 * ```ts
 * register({ provide: API_TOKEN, useValue: '/api/v2' });
 * register([
 *   { provide: PLUGIN, multi: true, useClass: AuthPlugin },
 *   { provide: PLUGIN, multi: true, useClass: LogPlugin },
 * ], 'root');
 * ```
 */
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
            var msg = "[DI Error] Token '".concat(token, "' is Single, cannot add Multi provider.");
            throw new Error(msg);
        }
        if (!isMulti && existingMode === 'multi') {
            var msg = "[DI Error] Token '".concat(token, "' is Multi, cannot add Single provider.");
            throw new Error(msg);
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
/**
 * Class decorator that binds a class to an `InjectorToken` as a single-value provider.
 *
 * When the token is resolved, the DI system returns this class's instance.
 * If another class also decorates with the same token, the later one overwrites
 * (with a dev-mode warning).
 *
 * @param token - The InjectorToken to bind to.
 * @param scope - Scope for the binding (defaults to `'root'`).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * const CACHE = InjectorToken.get<CacheService>('CACHE');
 *
 * @Token(CACHE)
 * @Injectable()
 * class RedisCacheService implements CacheService { ... }
 * ```
 */
function Token(token, scope) {
    if (scope === void 0) { scope = metadata_1.ROOT_SCOPE; }
    return function (target) {
        validateBinding(target, scope, token);
        register({ provide: token, useExisting: target }, scope, true);
    };
}
/**
 * Class decorator that binds a class to an `InjectorToken` as a multi-value provider.
 *
 * Multiple classes can bind to the same token; resolving yields an array of all
 * registered implementations (scoped to the current injector's scope).
 *
 * @param token - The InjectorToken to bind to.
 * @param scope - Scope for the binding (defaults to `'root'`).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * const PLUGINS = InjectorToken.get<Plugin[]>('PLUGINS');
 *
 * @MultiToken(PLUGINS)
 * @Injectable()
 * class AuthPlugin implements Plugin { ... }
 *
 * @MultiToken(PLUGINS)
 * @Injectable()
 * class LogPlugin implements Plugin { ... }
 *
 * // Resolving PLUGINS returns [AuthPlugin, LogPlugin]
 * ```
 */
function MultiToken(token, scope) {
    if (scope === void 0) { scope = metadata_1.ROOT_SCOPE; }
    return function (target) {
        validateBinding(target, scope, token);
        register({ provide: token, multi: true, useExisting: target }, scope);
    };
}