/**
 * @file core/resolution.ts
 * @description Handles the logic for resolving dependencies, including parameter and property injection and transformation.
 */
import { DecoratorFlags, DI_DECORATOR_FLAG } from "../metadata/index.js";
import { ɵɵInject, ɵɵInjectAsync } from "../registry/index.js";
export var ResolveMode;
(function (ResolveMode) {
    ResolveMode[ResolveMode["Sync"] = 0] = "Sync";
    ResolveMode[ResolveMode["Async"] = 1] = "Async";
})(ResolveMode || (ResolveMode = {}));
const defCache = new WeakMap();
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
        if (item.transform)
            (transforms !== null && transforms !== void 0 ? transforms : (transforms = [])).push(item);
    }
    if (transforms)
        transforms.reverse();
    return { token: token, flags, transforms };
}
function getDef(metas) {
    if (Array.isArray(metas)) {
        let def = defCache.get(metas);
        if (!def) {
            def = compileDependency(metas);
            defCache.set(metas, def);
        }
        return def;
    }
    else {
        if (metas && (typeof metas === 'object' || typeof metas === 'function')) {
            let def = defCache.get(metas);
            if (!def) {
                def = { token: metas, flags: 0, transforms: undefined };
                defCache.set(metas, def);
            }
            return def;
        }
        return { token: metas, flags: 0, transforms: undefined };
    }
}
function resolveValue(metas, executor, context, mode) {
    const def = getDef(metas);
    let value;
    if (def.token !== undefined) {
        value = mode === ResolveMode.Async
            ? ɵɵInjectAsync(def.token, def.flags)
            : ɵɵInject(def.token, def.flags);
    }
    if (def.transforms) {
        if (mode === ResolveMode.Async && value instanceof Promise) {
            value = value.then(v => applyTransforms(def.transforms, executor, context, v));
        }
        else {
            value = applyTransforms(def.transforms, executor, context, value);
        }
    }
    return value;
}
function applyTransforms(transforms, executor, context, value) {
    for (const transformMeta of transforms) {
        value = executor(context, transformMeta.transform, transformMeta, value);
    }
    return value;
}
const paramExecutor = (args, t, m, v) => t(m, v, ...args);
export function resolveParams(deps, args = [], mode = ResolveMode.Sync) {
    const len = deps.length;
    const result = new Array(len);
    for (let i = 0; i < len; i++) {
        const dep = deps[i];
        if (Array.isArray(dep)) {
            result[i] = resolveValue(dep, paramExecutor, args, mode);
        }
        else {
            result[i] = mode === ResolveMode.Async ? ɵɵInjectAsync(dep, 0) : ɵɵInject(dep, 0);
        }
    }
    return result;
}
const propExecutor = (ctx, t, m, v) => t(m, v, ctx.target, ctx.key);
export function resolveProps(target, props, mode = ResolveMode.Sync) {
    if (mode === ResolveMode.Async) {
        const promises = [];
        for (const key in props) {
            const v = resolveValue(props[key], propExecutor, { target, key }, mode);
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
            const value = resolveValue(props[key], propExecutor, { target, key }, mode);
            if (value !== target[key])
                target[key] = value;
        }
        return target;
    }
}
