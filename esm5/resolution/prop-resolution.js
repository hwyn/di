/**
 * @file core/resolution.ts
 * @description Handles the logic for resolving dependencies, including parameter and property injection and transformation.
 */
import { __assign, __values } from "tslib";
import { DecoratorFlags, DI_DECORATOR_FLAG, ResolveMode } from "../metadata/index.js";
import { getInjector, ɵɵInject, ɵɵInjectAsync } from "../registry/index.js";
var defCache = new WeakMap();
var EMPTY_DEF = { token: undefined, flags: 0, transforms: undefined };
function compileDependency(metas) {
    var flags = 0;
    var injectToken;
    var pipeToken;
    var typeToken;
    var transforms;
    for (var i = 0, len = metas.length; i < len; i++) {
        var item = metas[i];
        var flag = item[DI_DECORATOR_FLAG];
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
    var token = injectToken !== null && injectToken !== void 0 ? injectToken : (pipeToken ? undefined : typeToken);
    return { token: token, flags: flags, transforms: transforms };
}
function getDef(metas) {
    if (!Array.isArray(metas)) {
        var isObjectOrFunc = metas && (typeof metas === 'object' || typeof metas === 'function');
        return isObjectOrFunc ? { token: metas, flags: 0, transforms: undefined } : EMPTY_DEF;
    }
    var def = defCache.get(metas);
    if (!def) {
        def = compileDependency(metas);
        defCache.set(metas, def);
    }
    return def;
}
function resolveValue(metas, context, mode) {
    var def = getDef(metas);
    var value;
    if (def.token !== undefined) {
        value = mode === ResolveMode.Async ? ɵɵInjectAsync(def.token, def.flags) : ɵɵInject(def.token, def.flags);
    }
    if (def.transforms) {
        if (mode === ResolveMode.Async && value instanceof Promise) {
            var asyncContext_1 = __assign({}, context);
            value = value.then(function (v) { return applyTransforms(def.transforms, asyncContext_1, v, mode); });
        }
        else {
            value = applyTransforms(def.transforms, context, value, mode);
        }
    }
    return value;
}
function applyTransforms(transforms, context, initialValue, mode) {
    var e_1, _a;
    var args = context.args, target = context.target, key = context.key, injector = context.injector;
    var inj = injector;
    if (mode === ResolveMode.Async) {
        return transforms.reduce(function (chain, meta) { return chain.then(function (val) {
            return inj.getAsync(meta.token).then(function (pipe) { return pipe.transform({
                mode: mode,
                value: val,
                meta: meta,
                args: args,
                target: target,
                key: key,
                injector: inj
            }); });
        }); }, Promise.resolve(initialValue));
    }
    var value = initialValue;
    try {
        for (var transforms_1 = __values(transforms), transforms_1_1 = transforms_1.next(); !transforms_1_1.done; transforms_1_1 = transforms_1.next()) {
            var meta = transforms_1_1.value;
            value = inj.get(meta.token).transform({
                mode: mode,
                value: value,
                meta: meta,
                args: args,
                target: target,
                key: key,
                injector: inj
            });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (transforms_1_1 && !transforms_1_1.done && (_a = transforms_1.return)) _a.call(transforms_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return value;
}
export function resolveParams(deps, args, mode) {
    if (args === void 0) { args = []; }
    if (mode === void 0) { mode = ResolveMode.Sync; }
    var len = deps.length;
    var result = new Array(len);
    var context = { args: args, key: 0, injector: getInjector() };
    for (var i = 0; i < len; i++) {
        var dep = deps[i];
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
export function resolveProps(target, props, mode) {
    if (mode === void 0) { mode = ResolveMode.Sync; }
    var context = { target: target, key: '', injector: getInjector() };
    if (mode === ResolveMode.Async) {
        var promises = [];
        var _loop_1 = function (key) {
            context.key = key;
            var v = resolveValue(props[key], context, mode);
            if (v instanceof Promise) {
                promises.push(v.then(function (val) {
                    if (val !== target[key])
                        target[key] = val;
                }));
            }
            else {
                if (v !== target[key])
                    target[key] = v;
            }
        };
        for (var key in props) {
            _loop_1(key);
        }
        return Promise.all(promises).then(function () { return target; });
    }
    else {
        for (var key in props) {
            context.key = key;
            var value = resolveValue(props[key], context, mode);
            if (value !== target[key])
                target[key] = value;
        }
        return target;
    }
}