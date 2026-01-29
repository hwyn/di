"use strict";
/**
 * @file impl/static-injector.ts
 * @description Concrete implementation of the Injector class (StaticInjector), managing scope and resolution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticInjector = exports.InjectFlags = void 0;
exports.deepProviders = deepProviders;
var tslib_1 = require("tslib");
var registry_1 = require("../registry");
var metadata_1 = require("../metadata");
var common_1 = require("../common");
var instantiator_1 = require("./instantiator");
var strategy_1 = require("./strategy");
var async_governance_1 = require("./async-governance");
var standard_hook_1 = require("./standard-hook");
var resolution_checks_1 = require("./resolution-checks");
var contextual_injector_1 = require("./contextual-injector");
var metadata_2 = require("../metadata");
Object.defineProperty(exports, "InjectFlags", { enumerable: true, get: function () { return metadata_2.InjectFlags; } });
function deepProviders(injector, providers) {
    (0, common_1.deepForEach)(providers, function (item) {
        var _a;
        injector.set((_a = item.provide) !== null && _a !== void 0 ? _a : item, item);
    });
}
var StaticInjector = /** @class */ (function () {
    function StaticInjector(additionalProviders, parent) {
        var _this = this;
        var _a, _b;
        this.isDestroyed = false;
        this.onDestroy = new Map();
        this.records = new Map();
        this.interceptStrategy = null;
        this.parent = parent;
        deepProviders(this, additionalProviders);
        this.records.set(registry_1.INJECTOR, (0, strategy_1.makeRecord)(function () { return _this; }, this));
        this.scope = this.get(registry_1.INJECTOR_SCOPE, metadata_1.InjectFlags.Optional | metadata_1.InjectFlags.Self);
        var localInterceptors = this.get(registry_1.INTERCEPTORS, metadata_1.InjectFlags.Optional | metadata_1.InjectFlags.Self);
        var parentStrategy = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.interceptStrategy) !== null && _b !== void 0 ? _b : null;
        this.interceptStrategy = (0, strategy_1.composeInterceptors)(localInterceptors, parentStrategy, this);
    }
    Object.defineProperty(StaticInjector.prototype, "destroyed", {
        get: function () { return this.isDestroyed; },
        enumerable: false,
        configurable: true
    });
    StaticInjector.prototype.get = function (token, flags) {
        var _this = this;
        if (flags === void 0) { flags = metadata_1.InjectFlags.Default; }
        common_1.DEBUG_MODE.enabled && (0, common_1.debugLog)('get', token.name || token);
        var _a = this.resolveBoundaryOrCache(token, flags, function (p, f) { return p.get(token, f); }), value = _a.value, record = _a.record;
        if (value !== metadata_1.NO_VALUE)
            return value;
        if (record) {
            async_governance_1.AsyncGovernance.enforceLock(record, token.name || token);
        }
        if (record === null)
            return this.tryParent(token, flags, null);
        var prev = (0, registry_1.getInjector)();
        if (prev === this)
            return this.tryResolve(token, record, flags);
        return (0, registry_1.runInInjectionContext)(this, function () {
            try {
                return _this.tryResolve(token, record, flags);
            }
            catch (e) {
                throw (0, common_1.enhanceError)(e, token);
            }
        });
    };
    StaticInjector.prototype.getAsync = function (token_1) {
        return tslib_1.__awaiter(this, arguments, Promise, function (token, flags, resolutionStack) {
            var _a, value, record, prev, ctx;
            var _this = this;
            if (flags === void 0) { flags = metadata_1.InjectFlags.Default; }
            if (resolutionStack === void 0) { resolutionStack = new Set(); }
            return tslib_1.__generator(this, function (_b) {
                common_1.DEBUG_MODE.enabled && (0, common_1.debugLog)('getAsync', token.name || token);
                _a = this.resolveBoundaryOrCache(token, flags, function (p, f) { return p.getAsync(token, f); }), value = _a.value, record = _a.record;
                if (value !== metadata_1.NO_VALUE)
                    return [2 /*return*/, value];
                if (resolutionStack.has(token)) {
                    throw new Error("Cyclic dependency detected in async resolution: ".concat(Array.from(resolutionStack).map(function (t) { return t.name || t; }).join(' -> '), " -> ").concat(token.name || token));
                }
                if (record && record.resolving) {
                    return [2 /*return*/, record.resolving];
                }
                if (record === null)
                    return [2 /*return*/, this.tryParentAsync(token, flags, null, resolutionStack)];
                prev = (0, registry_1.getInjector)();
                if (prev === this)
                    return [2 /*return*/, this.tryResolveAsync(token, record, flags)];
                resolutionStack.add(token);
                ctx = new contextual_injector_1.ContextualInjector(this, resolutionStack);
                return [2 /*return*/, (0, registry_1.runInInjectionContext)(this, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var e_1;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, 3, 4]);
                                    return [4 /*yield*/, this.tryResolveAsync(token, record, flags, ctx)];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    e_1 = _a.sent();
                                    throw (0, common_1.enhanceError)(e_1, token);
                                case 3:
                                    resolutionStack.delete(token);
                                    return [7 /*endfinally*/];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    StaticInjector.prototype.set = function (token, provider) {
        var _a;
        if ((0, standard_hook_1.onAdmission)(token, provider || token, this) === false)
            return null;
        var isMulti = provider.multi;
        if (isMulti) {
            var record_1 = this.records.get(token);
            if (record_1 && (record_1.value !== metadata_1.NO_VALUE || record_1.resolving)) {
                var msg = "[DI] Warning: Trying to add a provider to an already resolved multi-token '".concat(token.name || token, "'. This provider will be ignored.");
                if (common_1.InstantiationPolicy.strictMultiInjection) {
                    throw new Error(msg.replace('Warning:', 'Error:'));
                }
                (_a = common_1.InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(msg);
                return;
            }
            if (!record_1 || !record_1.multi) {
                record_1 = (0, strategy_1.makeRecord)(function (ctx) { return (0, strategy_1.resolveMulti)(token, record_1.multi, ctx); }, metadata_1.NO_VALUE, true);
                this.records.set(token, record_1);
            }
            record_1.multi.push(provider);
        }
        else {
            var record = this.records.get(token);
            if (record && record.value !== metadata_1.NO_VALUE) {
                throw new Error("[DI] Error: Cannot overwrite provider for '".concat(token.name || token, "' because it has already been instantiated."));
            }
            this.records.set(token, { factory: undefined, value: metadata_1.NO_VALUE, multi: undefined, provider: provider });
        }
    };
    StaticInjector.prototype.resolveBoundaryOrCache = function (token, flags, delegate) {
        if (this.isDestroyed)
            return { value: null, record: undefined };
        if (flags & metadata_1.InjectFlags.SkipSelf) {
            (0, resolution_checks_1.validateSkipSelf)(flags);
            if (this.parent)
                return { value: delegate(this.parent, flags & ~metadata_1.InjectFlags.SkipSelf), record: undefined };
            return { value: (0, resolution_checks_1.checkNoProvider)(token, flags), record: undefined };
        }
        var record = this.records.get(token);
        if (record &&
            record.value !== metadata_1.NO_VALUE &&
            !((flags & metadata_1.RecordFlags.MaskFromChild) && (record.flags & metadata_1.RecordFlags.Private)) &&
            !(0, standard_hook_1.onTransientCheck)(token, record, this)) {
            return { value: record.value, record: record };
        }
        return { value: metadata_1.NO_VALUE, record: record };
    };
    StaticInjector.prototype.destroy = function () {
        var e_2, _a;
        var _this = this;
        if (this.isDestroyed)
            return;
        this.isDestroyed = true;
        var promises = [];
        var entries = Array.from(this.onDestroy).reverse();
        try {
            for (var entries_1 = tslib_1.__values(entries), entries_1_1 = entries_1.next(); !entries_1_1.done; entries_1_1 = entries_1.next()) {
                var _b = tslib_1.__read(entries_1_1.value, 2), service = _b[0], token = _b[1];
                var result = (0, standard_hook_1.onDispose)(token, service, this);
                if (result instanceof Promise)
                    promises.push(result);
                var p = (0, instantiator_1.dispose)(service);
                if (p instanceof Promise)
                    promises.push(p);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (entries_1_1 && !entries_1_1.done && (_a = entries_1.return)) _a.call(entries_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (promises.length) {
            return Promise.allSettled(promises).then(function () { return _this.cleanup(); });
        }
        this.cleanup();
    };
    StaticInjector.prototype.cleanup = function () {
        this.onDestroy.clear();
        this.parent = undefined;
        this.records.clear();
    };
    StaticInjector.prototype.getRecord = function (token) {
        return this.records.get(token);
    };
    StaticInjector.prototype.tryParent = function (token, flags, record) {
        var _a;
        (0, resolution_checks_1.checkSelfAndOptional)(token, flags, record);
        return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.get(token, flags | metadata_1.RecordFlags.MaskFromChild);
    };
    StaticInjector.prototype.tryParentAsync = function (token, flags, record, stack) {
        var _a;
        (0, resolution_checks_1.checkSelfAndOptional)(token, flags, record);
        if (this.parent instanceof StaticInjector && stack) {
            return this.parent.getAsync(token, flags | metadata_1.RecordFlags.MaskFromChild, stack);
        }
        return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.getAsync(token, flags | metadata_1.RecordFlags.MaskFromChild);
    };
    StaticInjector.prototype.tryResolve = function (token, record, flags) {
        record = this.resolveRecord(token, record);
        (0, resolution_checks_1.validateResolution)(token, record, flags);
        if (record)
            return this.hydrateSync(token, record);
        if (this.parent)
            return this.tryParent(token, flags, record);
        if (flags & metadata_1.InjectFlags.Optional)
            return null;
        throw new Error("No provider for ".concat(token.name || token));
    };
    StaticInjector.prototype.tryResolveAsync = function (token, record, flags, ctx) {
        if (ctx === void 0) { ctx = this; }
        record = this.resolveRecord(token, record);
        (0, resolution_checks_1.validateResolution)(token, record, flags);
        if (record)
            return this.hydrateAsync(token, record, ctx);
        if (this.parent) {
            var stack = ctx instanceof contextual_injector_1.ContextualInjector ? ctx.stack : undefined;
            return this.tryParentAsync(token, flags, record, stack);
        }
        if (flags & metadata_1.InjectFlags.Optional)
            return null;
        throw new Error("No provider for ".concat(token.name || token));
    };
    StaticInjector.prototype.resolveRecord = function (token, record) {
        if (record === null)
            return null;
        if (record === null || record === void 0 ? void 0 : record.factory)
            return record;
        var resolved = (0, strategy_1.resolveDefinition)(token, record, this.scope, this);
        this.records.set(token, resolved);
        return resolved;
    };
    StaticInjector.prototype.hydrateSync = function (token, record) {
        async_governance_1.AsyncGovernance.enforceLock(record, token.toString());
        var value = (0, instantiator_1.instantiate)(token, record, this);
        if (value instanceof Promise && !(record.provider && 'useValue' in record.provider)) {
            async_governance_1.AsyncGovernance.enforceSyncConstraint(token);
        }
        return this.finishHydrate(token, record, value);
    };
    StaticInjector.prototype.hydrateAsync = function (token_1, record_2) {
        return tslib_1.__awaiter(this, arguments, Promise, function (token, record, ctx) {
            var worker, value, _a, _b, item;
            var e_3, _c;
            if (ctx === void 0) { ctx = this; }
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        worker = record.multi ? (0, strategy_1.resolveMultiAsync)(token, record.multi, this) : (0, instantiator_1.instantiateAsync)(token, record, ctx);
                        return [4 /*yield*/, async_governance_1.AsyncGovernance.governLifecycle(record, worker)];
                    case 1:
                        value = _d.sent();
                        if (this.isDestroyed) {
                            if (record.multi) {
                                try {
                                    for (_a = tslib_1.__values(value), _b = _a.next(); !_b.done; _b = _a.next()) {
                                        item = _b.value;
                                        if ((0, instantiator_1.isDisposable)(item))
                                            (0, instantiator_1.dispose)(item);
                                    }
                                }
                                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                finally {
                                    try {
                                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                    }
                                    finally { if (e_3) throw e_3.error; }
                                }
                            }
                            else if ((0, instantiator_1.isDisposable)(value)) {
                                (0, instantiator_1.dispose)(value);
                            }
                            throw new Error("Injector destroyed during resolution of: ".concat(token));
                        }
                        return [2 /*return*/, this.finishHydrate(token, record, value)];
                }
            });
        });
    };
    StaticInjector.prototype.finishHydrate = function (token, record, value) {
        if ((0, standard_hook_1.onTransientCheck)(token, record, this))
            return value;
        record.value = value;
        this.registerDispose(token, value, record);
        return value;
    };
    StaticInjector.prototype.registerDispose = function (token, value, record) {
        var e_4, _a;
        if (record.multi) {
            try {
                for (var _b = tslib_1.__values(value), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var item = _c.value;
                    if ((0, instantiator_1.isDisposable)(item))
                        this.onDestroy.set(item, token);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        else if ((0, instantiator_1.isDisposable)(value) && !(value instanceof StaticInjector)) {
            this.onDestroy.set(value, token);
        }
    };
    return StaticInjector;
}());
exports.StaticInjector = StaticInjector;
registry_1.Injector.create = function createInjector(providers, parent) {
    return new StaticInjector(providers, parent);
};