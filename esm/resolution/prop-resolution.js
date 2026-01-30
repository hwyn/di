/**
 * @file core/resolution.ts
 * @description Handles the logic for resolving dependencies, including parameter and property injection and transformation.
 */
import { DecoratorFlags, DI_DECORATOR_FLAG, ResolveMode } from "../metadata/index.js";
import { getInjector, ɵɵInject, ɵɵInjectAsync } from "../registry/index.js";
const defCache = new WeakMap();
const EMPTY_DEF = { token: undefined, flags: 0, transforms: undefined };
function compileDependency(metas) {
    let flags = 0;
    let injectToken;
    let pipeToken;
    let typeToken;
    let transforms;
    for (let i = 0, len = metas.length; i < len; i++) {
        const item = metas[i];
        const flag = item[DI_DECORATOR_FLAG];
        if (flag === DecoratorFlags.Inject) {
            injectToken = item.token;
        }
        else if (flag === DecoratorFlags.Pipeline) {
            pipeToken !== null && pipeToken !== void 0 ? pipeToken : (pipeToken = item.token);
            (transforms !== null && transforms !== void 0 ? transforms : (transforms = [])).push(item);
        }
        else if (typeof flag === 'number') {
            flags |= flag;
        }
        else if (flag === undefined) {
            typeToken = item;
        }
    }
    if (transforms)
        transforms.reverse();
    const token = injectToken !== null && injectToken !== void 0 ? injectToken : (pipeToken ? undefined : typeToken);
    return { token: token, flags, transforms };
}
function getDef(metas) {
    if (!Array.isArray(metas)) {
        const isObjectOrFunc = metas && (typeof metas === 'object' || typeof metas === 'function');
        return isObjectOrFunc ? { token: metas, flags: 0, transforms: undefined } : EMPTY_DEF;
    }
    let def = defCache.get(metas);
    if (!def) {
        def = compileDependency(metas);
        defCache.set(metas, def);
    }
    return def;
}
function resolveValue(metas, context, mode) {
    const def = getDef(metas);
    let value;
    if (def.token !== undefined) {
        value = mode === ResolveMode.Async ? ɵɵInjectAsync(def.token, def.flags) : ɵɵInject(def.token, def.flags);
    }
    if (def.transforms) {
        if (mode === ResolveMode.Async && value instanceof Promise) {
            const asyncContext = Object.assign({}, context);
            value = value.then(v => applyTransforms(def.transforms, asyncContext, v, mode));
        }
        else {
            value = applyTransforms(def.transforms, context, value, mode);
        }
    }
    return value;
}
function applyTransforms(transforms, context, initialValue, mode) {
    const { args, target, key, injector } = context;
    const inj = injector;
    if (mode === ResolveMode.Async) {
        return transforms.reduce((chain, meta) => chain.then((val) => {
            return inj.getAsync(meta.token).then((pipe) => pipe.transform({
                mode,
                value: val,
                meta,
                args,
                target,
                key,
                injector: inj
            }));
        }), Promise.resolve(initialValue));
    }
    let value = initialValue;
    for (const meta of transforms) {
        value = inj.get(meta.token).transform({
            mode,
            value,
            meta,
            args,
            target,
            key,
            injector: inj
        });
    }
    return value;
}
export function resolveParams(deps, args = [], mode = ResolveMode.Sync) {
    const len = deps.length;
    const result = new Array(len);
    const context = { args, key: 0, injector: getInjector() };
    for (let i = 0; i < len; i++) {
        const dep = deps[i];
        if (Array.isArray(dep)) {
            context.key = i;
            result[i] = resolveValue(dep, context, mode);
        }
        else {
            result[i] = mode === ResolveMode.Async ? ɵɵInjectAsync(dep, 0) : ɵɵInject(dep, 0);
        }
    }
    return result;
}
export function resolveProps(target, props, mode = ResolveMode.Sync) {
    const context = { target, key: '', injector: getInjector() };
    if (mode === ResolveMode.Async) {
        const promises = [];
        for (const key in props) {
            context.key = key;
            const v = resolveValue(props[key], context, mode);
            if (v instanceof Promise) {
                promises.push(v.then(val => {
                    if (val !== target[key])
                        target[key] = val;
                }));
            }
            else {
                if (v !== target[key])
                    target[key] = v;
            }
        }
        return Promise.all(promises).then(() => target);
    }
    else {
        for (const key in props) {
            context.key = key;
            const value = resolveValue(props[key], context, mode);
            if (value !== target[key])
                target[key] = value;
        }
        return target;
    }
}