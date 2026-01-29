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
    let token;
    let transforms;
    for (let i = 0, len = metas.length; i < len; i++) {
        const item = metas[i];
        const flag = item[DI_DECORATOR_FLAG];
        if (flag === DecoratorFlags.Inject) {
            token = item.token;
        }
        else if (typeof flag === 'number') {
            flags |= flag;
        }
        else if (!item.transform) {
            token = item;
        }
        if (item.transform) {
            (transforms !== null && transforms !== void 0 ? transforms : (transforms = [])).push(item);
        }
    }
    if (transforms)
        transforms.reverse();
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
function resolveValue(metas, executor, context, mode) {
    const def = getDef(metas);
    let value;
    if (def.token !== undefined) {
        value = mode === ResolveMode.Async ? ɵɵInjectAsync(def.token, def.flags) : ɵɵInject(def.token, def.flags);
    }
    if (def.transforms) {
        if (mode === ResolveMode.Async && value instanceof Promise) {
            value = value.then(v => applyTransforms(def.transforms, executor, context, v, mode));
        }
        else {
            value = applyTransforms(def.transforms, executor, context, value, mode);
        }
    }
    return value;
}
function applyTransforms(transforms, executor, context, initialValue, mode) {
    let value = initialValue;
    for (const meta of transforms) {
        value = executor(context, meta.transform, meta, value, mode);
    }
    return value;
}
const paramExecutor = (ctx, transform, meta, value, mode) => {
    return transform({
        mode,
        value,
        meta,
        args: ctx.args,
        key: ctx.key,
        injector: ctx.injector
    });
};
const propExecutor = (ctx, transform, meta, value, mode) => {
    return transform({
        mode,
        value,
        meta,
        target: ctx.target,
        key: ctx.key,
        injector: ctx.injector
    });
};
export function resolveParams(deps, args = [], mode = ResolveMode.Sync) {
    const len = deps.length;
    const result = new Array(len);
    const context = { args, key: 0, injector: getInjector() };
    for (let i = 0; i < len; i++) {
        const dep = deps[i];
        if (Array.isArray(dep)) {
            context.key = i;
            result[i] = resolveValue(dep, paramExecutor, context, mode);
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
            const v = resolveValue(props[key], propExecutor, context, mode);
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
            const value = resolveValue(props[key], propExecutor, context, mode);
            if (value !== target[key])
                target[key] = value;
        }
        return target;
    }
}