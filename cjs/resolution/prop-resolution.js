"use strict";
/**
 * @file core/resolution.ts
 * @description Handles the logic for resolving dependencies, including parameter and property injection and transformation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveParams = resolveParams;
exports.resolveProps = resolveProps;
var tslib_1 = require("tslib");
var metadata_1 = require("../metadata");
var registry_1 = require("../registry");
var defCache = new WeakMap();
var EMPTY_DEF = { token: undefined, flags: 0, transforms: undefined };
function compileDependency(metas) {
    var flags = 0;
    var token;
    var transforms;
    for (var i = 0, len = metas.length; i < len; i++) {
        var item = metas[i];
        var flag = item[metadata_1.DI_DECORATOR_FLAG];
        if (flag === metadata_1.DecoratorFlags.Inject) {
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
function resolveValue(metas, executor, context, mode) {
    var def = getDef(metas);
    var value;
    if (def.token !== undefined) {
        value = mode === metadata_1.ResolveMode.Async ? (0, registry_1.ɵɵInjectAsync)(def.token, def.flags) : (0, registry_1.ɵɵInject)(def.token, def.flags);
    }
    if (def.transforms) {
        if (mode === metadata_1.ResolveMode.Async && value instanceof Promise) {
            value = value.then(function (v) { return applyTransforms(def.transforms, executor, context, v, mode); });
        }
        else {
            value = applyTransforms(def.transforms, executor, context, value, mode);
        }
    }
    return value;
}
function applyTransforms(transforms, executor, context, initialValue, mode) {
    var e_1, _a;
    var value = initialValue;
    try {
        for (var transforms_1 = tslib_1.__values(transforms), transforms_1_1 = transforms_1.next(); !transforms_1_1.done; transforms_1_1 = transforms_1.next()) {
            var meta = transforms_1_1.value;
            value = executor(context, meta.transform, meta, value, mode);
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
var paramExecutor = function (ctx, transform, meta, value, mode) {
    return transform({
        mode: mode,
        value: value,
        meta: meta,
        args: ctx.args,
        key: ctx.key,
        injector: ctx.injector
    });
};
var propExecutor = function (ctx, transform, meta, value, mode) {
    return transform({
        mode: mode,
        value: value,
        meta: meta,
        target: ctx.target,
        key: ctx.key,
        injector: ctx.injector
    });
};
function resolveParams(deps, args, mode) {
    if (args === void 0) { args = []; }
    if (mode === void 0) { mode = metadata_1.ResolveMode.Sync; }
    var len = deps.length;
    var result = new Array(len);
    var context = { args: args, key: 0, injector: (0, registry_1.getInjector)() };
    for (var i = 0; i < len; i++) {
        var dep = deps[i];
        if (Array.isArray(dep)) {
            context.key = i;
            result[i] = resolveValue(dep, paramExecutor, context, mode);
        }
        else {
            result[i] = mode === metadata_1.ResolveMode.Async ? (0, registry_1.ɵɵInjectAsync)(dep, 0) : (0, registry_1.ɵɵInject)(dep, 0);
        }
    }
    return result;
}
function resolveProps(target, props, mode) {
    if (mode === void 0) { mode = metadata_1.ResolveMode.Sync; }
    var context = { target: target, key: '', injector: (0, registry_1.getInjector)() };
    if (mode === metadata_1.ResolveMode.Async) {
        var promises = [];
        var _loop_1 = function (key) {
            context.key = key;
            var v = resolveValue(props[key], propExecutor, context, mode);
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
            var value = resolveValue(props[key], propExecutor, context, mode);
            if (value !== target[key])
                target[key] = value;
        }
        return target;
    }
}