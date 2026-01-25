import { __awaiter } from "tslib";
import { instantiate, instantiateAsync } from "./instantiator.js";
import { ɵɵInject, HookMetadata } from "../registry/index.js";
import { resolveParams, resolveProps, ResolveMode } from "./prop-resolution.js";
import { EMPTY_ARRAY, getInjectableDef, IGNORE_SCOPE, NO_VALUE, Reflector } from "../metadata/index.js";
import { AsyncGovernance } from "./async-governance.js";
import { onAdmission, onScopeCheck } from "./standard-hook.js";
export function resolveDefinition(token, record, scope, ctx) {
    var _a;
    if (!record)
        return resolveDecoratedDef(token, scope, ctx);
    if (record.multi)
        return makeRecord((ctx) => resolveMulti(token, record.multi, ctx), NO_VALUE, true);
    if (record.factory) {
        const newRecord = makeRecord(record.factory, NO_VALUE);
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
    const def = getInjectableDef(token);
    if (!def)
        return null;
    if (onAdmission(token, token, ctx) === false)
        return null;
    const hookResult = onScopeCheck(def, scope, ctx);
    const isMatched = typeof hookResult === 'boolean' ? hookResult : checkScope(def, scope);
    if (!isMatched)
        return null;
    def.factory || (def.factory = convertToFactory(token, def.opt));
    const record = makeRecord(def.factory, NO_VALUE, false, undefined, (_a = def.opt) === null || _a === void 0 ? void 0 : _a.private);
    record.metadata = HookMetadata.get(token);
    return record;
}
export function checkScope(def, scope) {
    return scope === IGNORE_SCOPE || !def.providedIn || def.providedIn === scope;
}
export function makeRecord(factory, value = NO_VALUE, multi, provider, isPrivate) {
    const record = { factory, value, multi: multi ? [] : undefined, provider };
    if (isPrivate)
        record.flags = (record.flags || 0) | 268435456 /* RecordFlags.Private */;
    return record;
}
export function resolveMulti(token, providers, ctx) {
    const results = [];
    let hasPromise = false;
    for (const provider of providers) {
        const factory = convertToFactory(token, provider);
        const record = makeRecord(factory, NO_VALUE, false, provider);
        const result = instantiate(token, record, ctx);
        if (isPromise(result))
            hasPromise = true;
        results.push(result);
    }
    if (hasPromise)
        return AsyncGovernance.secureMultiResolve(results);
    return results;
}
export function resolveMultiAsync(token, providers, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [];
        for (const provider of providers) {
            const factory = convertToFactory(token, provider);
            const record = makeRecord(factory, NO_VALUE, false, provider);
            promises.push(instantiateAsync(token, record, ctx));
        }
        return AsyncGovernance.secureMultiResolve(promises);
    });
}
export function convertToFactory(type, provider) {
    if (!provider)
        return factory(Reflector.resolveParameters(type), type);
    if ('useValue' in provider)
        return () => provider.useValue;
    if ('useFactory' in provider)
        return createFromUseFactory(type, provider);
    if ('useExisting' in provider)
        return () => ɵɵInject(provider.useExisting);
    const useClass = provider.useClass || type;
    if (typeof useClass !== 'function')
        throwInvalidDefinition(type);
    const deps = provider.deps || Reflector.resolveParameters(useClass);
    return factory(deps, useClass);
}
function createFromUseFactory(type, provider) {
    const { useFactory, deps } = provider;
    if (!deps || deps.length === 0)
        return withType(() => useFactory(), type);
    const fn = (_, mode = ResolveMode.Sync) => {
        const params = resolveParams(deps, EMPTY_ARRAY, mode);
        for (let i = 0; i < params.length; i++) {
            if (isPromise(params[i])) {
                return AsyncGovernance.secureMultiResolve(params).then(args => useFactory(...args));
            }
        }
        return useFactory(...params);
    };
    return withType(fn, type);
}
function factory(deps, type) {
    const props = resolvePropsMetadata(type);
    if (deps.length === 0 && !props) {
        return withType(() => new type(), type);
    }
    if (!props)
        return withType(createDepsFactory(type, deps), type);
    return withType(createFullFactory(type, deps, props), type);
}
function createDepsFactory(type, deps) {
    return (_, mode = ResolveMode.Sync) => {
        const params = resolveParams(deps, EMPTY_ARRAY, mode);
        for (let i = 0; i < params.length; i++) {
            if (isPromise(params[i])) {
                return AsyncGovernance.secureMultiResolve(params).then(args => Reflect.construct(type, args));
            }
        }
        return Reflect.construct(type, params);
    };
}
function createFullFactory(type, deps, props) {
    return (_, mode = ResolveMode.Sync) => {
        const params = resolveParams(deps, EMPTY_ARRAY, mode);
        for (let i = 0; i < params.length; i++) {
            if (isPromise(params[i])) {
                return AsyncGovernance.secureMultiResolve(params).then((args) => __awaiter(this, void 0, void 0, function* () {
                    const instance = Reflect.construct(type, args);
                    return yield resolveProps(instance, props, ResolveMode.Async);
                }));
            }
        }
        return createInstance(type, params, props);
    };
}
function resolvePropsMetadata(type) {
    if (!Reflector.hasPropMetadata(type))
        return undefined;
    const props = Reflector.resolveProperties(type);
    for (const _ in props) {
        return props;
    }
    return undefined;
}
function withType(fn, type) {
    fn.__type__ = type;
    return fn;
}
function throwInvalidDefinition(type) {
    const name = type.name || type.toString();
    throw new Error(`Invalid provider definition for token: ${name}. ` +
        `Please ensure 'useClass', 'useValue', 'useFactory' or 'useExisting' is configured.`);
}
export function createInstance(type, args, props) {
    const instance = Reflect.construct(type, args);
    return props ? resolveProps(instance, props) : instance;
}
export function composeInterceptors(interceptors, parentStrategy, injector) {
    if ((!interceptors || interceptors.length === 0) && !parentStrategy) {
        return null;
    }
    return (instance, token) => {
        let result = instance;
        if (interceptors && interceptors.length > 0) {
            for (const fn of interceptors) {
                result = fn(result, token, injector);
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
