"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDefinition = resolveDefinition;
exports.checkScope = checkScope;
exports.makeRecord = makeRecord;
exports.resolveMulti = resolveMulti;
exports.resolveMultiAsync = resolveMultiAsync;
exports.convertToFactory = convertToFactory;
exports.createInstance = createInstance;
exports.composeInterceptors = composeInterceptors;
var tslib_1 = require("tslib");
var instantiator_1 = require("./instantiator");
var registry_1 = require("../registry");
var prop_resolution_1 = require("./prop-resolution");
var metadata_1 = require("../metadata");
var async_governance_1 = require("./async-governance");
var standard_hook_1 = require("./standard-hook");
function resolveDefinition(token, record, scope, ctx) {
    var _a;
    if (!record)
        return resolveDecoratedDef(token, scope, ctx);
    if (record.multi)
        return makeRecord(function (ctx) { return resolveMulti(token, record.multi, ctx); }, metadata_1.NO_VALUE, true);
    if (record.factory) {
        var newRecord = makeRecord(record.factory, metadata_1.NO_VALUE);
        newRecord.flags = record.flags;
        return newRecord;
    }
    if (record.provider) {
        return makeRecord(convertToFactory(token, record.provider), metadata_1.NO_VALUE, false, undefined, (_a = record.provider) === null || _a === void 0 ? void 0 : _a.private);
    }
    return null;
}
function resolveDecoratedDef(token, scope, ctx) {
    var _a;
    var def = (0, metadata_1.getInjectableDef)(token);
    if (!def)
        return null;
    if ((0, standard_hook_1.onAdmission)(token, token, ctx) === false)
        return null;
    var hookResult = (0, standard_hook_1.onScopeCheck)(def, scope, ctx);
    var isMatched = typeof hookResult === 'boolean' ? hookResult : checkScope(def, scope);
    if (!isMatched)
        return null;
    def.factory || (def.factory = convertToFactory(token, def.opt));
    var record = makeRecord(def.factory, metadata_1.NO_VALUE, false, undefined, (_a = def.opt) === null || _a === void 0 ? void 0 : _a.private);
    record.metadata = registry_1.HookMetadata.get(token);
    return record;
}
function checkScope(def, scope) {
    return scope === metadata_1.IGNORE_SCOPE || !def.providedIn || def.providedIn === scope;
}
function makeRecord(factory, value, multi, provider, isPrivate) {
    if (value === void 0) { value = metadata_1.NO_VALUE; }
    var record = { factory: factory, value: value, multi: multi ? [] : undefined, provider: provider };
    if (isPrivate)
        record.flags = (record.flags || 0) | 268435456 /* RecordFlags.Private */;
    return record;
}
function resolveMulti(token, providers, ctx) {
    var e_1, _a;
    var results = [];
    var hasPromise = false;
    try {
        for (var providers_1 = tslib_1.__values(providers), providers_1_1 = providers_1.next(); !providers_1_1.done; providers_1_1 = providers_1.next()) {
            var provider = providers_1_1.value;
            var factory_1 = convertToFactory(token, provider);
            var record = makeRecord(factory_1, metadata_1.NO_VALUE, false, provider);
            var result = (0, instantiator_1.instantiate)(token, record, ctx);
            if (isPromise(result))
                hasPromise = true;
            results.push(result);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (providers_1_1 && !providers_1_1.done && (_a = providers_1.return)) _a.call(providers_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (hasPromise)
        return async_governance_1.AsyncGovernance.secureMultiResolve(results);
    return results;
}
function resolveMultiAsync(token, providers, ctx) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var promises, providers_2, providers_2_1, provider, factory_2, record;
        var e_2, _a;
        return tslib_1.__generator(this, function (_b) {
            promises = [];
            try {
                for (providers_2 = tslib_1.__values(providers), providers_2_1 = providers_2.next(); !providers_2_1.done; providers_2_1 = providers_2.next()) {
                    provider = providers_2_1.value;
                    factory_2 = convertToFactory(token, provider);
                    record = makeRecord(factory_2, metadata_1.NO_VALUE, false, provider);
                    promises.push((0, instantiator_1.instantiateAsync)(token, record, ctx));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (providers_2_1 && !providers_2_1.done && (_a = providers_2.return)) _a.call(providers_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return [2 /*return*/, async_governance_1.AsyncGovernance.secureMultiResolve(promises)];
        });
    });
}
function convertToFactory(type, provider) {
    if (!provider)
        return factory(metadata_1.Reflector.resolveParameters(type), type);
    if ('useValue' in provider)
        return function () { return provider.useValue; };
    if ('useFactory' in provider)
        return createFromUseFactory(type, provider);
    if ('useExisting' in provider)
        return function () { return (0, registry_1.ɵɵInject)(provider.useExisting); };
    var useClass = provider.useClass || type;
    if (typeof useClass !== 'function')
        throwInvalidDefinition(type);
    var deps = provider.deps || metadata_1.Reflector.resolveParameters(useClass);
    return factory(deps, useClass);
}
function createFromUseFactory(type, provider) {
    var useFactory = provider.useFactory, deps = provider.deps;
    if (!deps || deps.length === 0)
        return withType(function () { return useFactory(); }, type);
    var fn = function (_, mode) {
        if (mode === void 0) { mode = prop_resolution_1.ResolveMode.Sync; }
        var params = (0, prop_resolution_1.resolveParams)(deps, metadata_1.EMPTY_ARRAY, mode);
        for (var i = 0; i < params.length; i++) {
            if (isPromise(params[i])) {
                return async_governance_1.AsyncGovernance.secureMultiResolve(params).then(function (args) { return useFactory.apply(void 0, tslib_1.__spreadArray([], tslib_1.__read(args), false)); });
            }
        }
        return useFactory.apply(void 0, tslib_1.__spreadArray([], tslib_1.__read(params), false));
    };
    return withType(fn, type);
}
function factory(deps, type) {
    var props = resolvePropsMetadata(type);
    if (deps.length === 0 && !props) {
        return withType(function () { return new type(); }, type);
    }
    if (!props)
        return withType(createDepsFactory(type, deps), type);
    return withType(createFullFactory(type, deps, props), type);
}
function createDepsFactory(type, deps) {
    return function (_, mode) {
        if (mode === void 0) { mode = prop_resolution_1.ResolveMode.Sync; }
        var params = (0, prop_resolution_1.resolveParams)(deps, metadata_1.EMPTY_ARRAY, mode);
        for (var i = 0; i < params.length; i++) {
            if (isPromise(params[i])) {
                return async_governance_1.AsyncGovernance.secureMultiResolve(params).then(function (args) { return Reflect.construct(type, args); });
            }
        }
        return Reflect.construct(type, params);
    };
}
function createFullFactory(type, deps, props) {
    var _this = this;
    return function (_, mode) {
        if (mode === void 0) { mode = prop_resolution_1.ResolveMode.Sync; }
        var params = (0, prop_resolution_1.resolveParams)(deps, metadata_1.EMPTY_ARRAY, mode);
        for (var i = 0; i < params.length; i++) {
            if (isPromise(params[i])) {
                return async_governance_1.AsyncGovernance.secureMultiResolve(params).then(function (args) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var instance;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                instance = Reflect.construct(type, args);
                                return [4 /*yield*/, (0, prop_resolution_1.resolveProps)(instance, props, prop_resolution_1.ResolveMode.Async)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); });
            }
        }
        return createInstance(type, params, props);
    };
}
function resolvePropsMetadata(type) {
    if (!metadata_1.Reflector.hasPropMetadata(type))
        return undefined;
    var props = metadata_1.Reflector.resolveProperties(type);
    for (var _1 in props) {
        return props;
    }
    return undefined;
}
function withType(fn, type) {
    fn.__type__ = type;
    return fn;
}
function throwInvalidDefinition(type) {
    var name = type.name || type.toString();
    throw new Error("Invalid provider definition for token: ".concat(name, ". ") +
        "Please ensure 'useClass', 'useValue', 'useFactory' or 'useExisting' is configured.");
}
function createInstance(type, args, props) {
    var instance = Reflect.construct(type, args);
    return props ? (0, prop_resolution_1.resolveProps)(instance, props) : instance;
}
function composeInterceptors(interceptors, parentStrategy, injector) {
    if ((!interceptors || interceptors.length === 0) && !parentStrategy) {
        return null;
    }
    return function (instance, token) {
        var e_3, _a;
        var result = instance;
        if (interceptors && interceptors.length > 0) {
            try {
                for (var interceptors_1 = tslib_1.__values(interceptors), interceptors_1_1 = interceptors_1.next(); !interceptors_1_1.done; interceptors_1_1 = interceptors_1.next()) {
                    var fn = interceptors_1_1.value;
                    result = fn(result, token, injector);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (interceptors_1_1 && !interceptors_1_1.done && (_a = interceptors_1.return)) _a.call(interceptors_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        if (parentStrategy) {
            result = parentStrategy(result, token);
        }
        return result;
    };
}
function isPromise(obj) {
    return !!obj && typeof obj.then === 'function';
}
