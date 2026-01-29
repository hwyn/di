import { __awaiter, __generator, __read, __spreadArray, __values } from "tslib";
import { instantiate, instantiateAsync } from "./instantiator.js";
import { ɵɵInject, HookMetadata } from "../registry/index.js";
import { resolveParams, resolveProps } from "./prop-resolution.js";
import { EMPTY_ARRAY, getInjectableDef, IGNORE_SCOPE, NO_VALUE, RecordFlags, Reflector, ResolveMode } from "../metadata/index.js";
import { AsyncGovernance } from "./async-governance.js";
import { onAdmission, onScopeCheck } from "./standard-hook.js";
export function resolveDefinition(token, record, scope, ctx) {
    var _a;
    if (!record)
        return resolveDecoratedDef(token, scope, ctx);
    if (record.multi)
        return makeRecord(function (ctx) { return resolveMulti(token, record.multi, ctx); }, NO_VALUE, true);
    if (record.factory) {
        var newRecord = makeRecord(record.factory, NO_VALUE);
        newRecord.flags = record.flags;
        return newRecord;
    }
    if (record.provider) {
        return makeRecord(convertToFactory(token, record.provider), NO_VALUE, false, undefined, (_a = record.provider) === null || _a === void 0 ? void 0 : _a.private);
    }
    return null;
}
function resolveDecoratedDef(token, scope, ctx) {
    var _a;
    var def = getInjectableDef(token);
    if (!def)
        return null;
    if (onAdmission(token, token, ctx) === false)
        return null;
    var hookResult = onScopeCheck(def, scope, ctx);
    var isMatched = typeof hookResult === 'boolean' ? hookResult : checkScope(def, scope);
    if (!isMatched)
        return null;
    def.factory || (def.factory = convertToFactory(token, def.opt));
    var record = makeRecord(def.factory, NO_VALUE, false, undefined, (_a = def.opt) === null || _a === void 0 ? void 0 : _a.private);
    record.metadata = HookMetadata.get(token);
    return record;
}
export function checkScope(def, scope) {
    return scope === IGNORE_SCOPE || !def.scope || def.scope === scope;
}
export function makeRecord(factory, value, multi, provider, isPrivate) {
    if (value === void 0) { value = NO_VALUE; }
    var record = { factory: factory, value: value, multi: multi ? [] : undefined, provider: provider };
    if (isPrivate)
        record.flags = (record.flags || 0) | RecordFlags.Private;
    return record;
}
export function resolveMulti(token, providers, ctx) {
    var e_1, _a;
    var results = [];
    var masks = [];
    var hasPromise = false;
    try {
        for (var providers_1 = __values(providers), providers_1_1 = providers_1.next(); !providers_1_1.done; providers_1_1 = providers_1.next()) {
            var provider = providers_1_1.value;
            var factory_1 = convertToFactory(token, provider);
            var record = makeRecord(factory_1, NO_VALUE, false, provider);
            var result = instantiate(token, record, ctx);
            if (isPromise(result))
                hasPromise = true;
            results.push(result);
            masks.push(!('useExisting' in provider || 'useValue' in provider));
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
        return AsyncGovernance.secureMultiResolve(results, masks);
    return results;
}
export function resolveMultiAsync(token, providers, ctx) {
    return __awaiter(this, void 0, Promise, function () {
        var promises, masks, providers_2, providers_2_1, provider, factory_2, record;
        var e_2, _a;
        return __generator(this, function (_b) {
            promises = [];
            masks = [];
            try {
                for (providers_2 = __values(providers), providers_2_1 = providers_2.next(); !providers_2_1.done; providers_2_1 = providers_2.next()) {
                    provider = providers_2_1.value;
                    factory_2 = convertToFactory(token, provider);
                    record = makeRecord(factory_2, NO_VALUE, false, provider);
                    promises.push(instantiateAsync(token, record, ctx));
                    masks.push(!('useExisting' in provider || 'useValue' in provider));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (providers_2_1 && !providers_2_1.done && (_a = providers_2.return)) _a.call(providers_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return [2 /*return*/, AsyncGovernance.secureMultiResolve(promises, masks)];
        });
    });
}
export function convertToFactory(type, provider) {
    if (!provider)
        return factory(Reflector.resolveParameters(type), type);
    if ('useValue' in provider)
        return function () { return provider.useValue; };
    if ('useFactory' in provider)
        return createFromUseFactory(type, provider);
    if ('useExisting' in provider)
        return function () { return ɵɵInject(provider.useExisting); };
    var useClass = provider.useClass || type;
    if (typeof useClass !== 'function')
        throwInvalidDefinition(type);
    var deps = provider.deps || Reflector.resolveParameters(useClass);
    return factory(deps, useClass);
}
function createFromUseFactory(type, provider) {
    var useFactory = provider.useFactory, deps = provider.deps;
    if (!deps || deps.length === 0)
        return withType(function () { return useFactory(); }, type);
    var fn = function (_, mode) {
        if (mode === void 0) { mode = ResolveMode.Sync; }
        var params = resolveParams(deps, EMPTY_ARRAY, mode);
        for (var i = 0; i < params.length; i++) {
            if (isPromise(params[i])) {
                var mask = new Array(params.length).fill(false);
                return AsyncGovernance.secureMultiResolve(params, mask).then(function (args) { return useFactory.apply(void 0, __spreadArray([], __read(args), false)); });
            }
        }
        return useFactory.apply(void 0, __spreadArray([], __read(params), false));
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
        if (mode === void 0) { mode = ResolveMode.Sync; }
        var params = resolveParams(deps, EMPTY_ARRAY, mode);
        for (var i = 0; i < params.length; i++) {
            if (isPromise(params[i])) {
                var mask = new Array(params.length).fill(false);
                return AsyncGovernance.secureMultiResolve(params, mask).then(function (args) { return Reflect.construct(type, args); });
            }
        }
        return Reflect.construct(type, params);
    };
}
function createFullFactory(type, deps, props) {
    var _this = this;
    return function (_, mode) {
        if (mode === void 0) { mode = ResolveMode.Sync; }
        var params = resolveParams(deps, EMPTY_ARRAY, mode);
        for (var i = 0; i < params.length; i++) {
            if (isPromise(params[i])) {
                var mask = new Array(params.length).fill(false);
                return AsyncGovernance.secureMultiResolve(params, mask).then(function (args) { return __awaiter(_this, void 0, void 0, function () {
                    var instance;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                instance = Reflect.construct(type, args);
                                return [4 /*yield*/, resolveProps(instance, props, ResolveMode.Async)];
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
    if (!Reflector.hasPropMetadata(type))
        return undefined;
    var props = Reflector.resolveProperties(type);
    for (var _ in props) {
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
export function createInstance(type, args, props) {
    var instance = Reflect.construct(type, args);
    return props ? resolveProps(instance, props) : instance;
}
export function composeInterceptors(interceptors, parentStrategy, injector) {
    if ((!interceptors || interceptors.length === 0) && !parentStrategy) {
        return null;
    }
    return function (instance, token) {
        var e_3, _a;
        var result = instance;
        if (interceptors && interceptors.length > 0) {
            try {
                for (var interceptors_1 = __values(interceptors), interceptors_1_1 = interceptors_1.next(); !interceptors_1_1.done; interceptors_1_1 = interceptors_1.next()) {
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