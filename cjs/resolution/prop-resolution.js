"use strict";
/**
 * @file core/resolution.ts
 * @description Handles the logic for resolving dependencies, including parameter and property injection and transformation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveMode = void 0;
exports.resolveParams = resolveParams;
exports.resolveProps = resolveProps;
var tslib_1 = require("tslib");
var metadata_1 = require("../metadata");
var registry_1 = require("../registry");
var ResolveMode;
(function (ResolveMode) {
    ResolveMode[ResolveMode["Sync"] = 0] = "Sync";
    ResolveMode[ResolveMode["Async"] = 1] = "Async";
})(ResolveMode || (exports.ResolveMode = ResolveMode = {}));
var defCache = new WeakMap();
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
        if (item.transform)
            (transforms !== null && transforms !== void 0 ? transforms : (transforms = [])).push(item);
    }
    if (transforms)
        transforms.reverse();
    return { token: token, flags: flags, transforms: transforms };
}
function getDef(metas) {
    if (Array.isArray(metas)) {
        var def = defCache.get(metas);
        if (!def) {
            def = compileDependency(metas);
            defCache.set(metas, def);
        }
        return def;
    }
    else {
        if (metas && (typeof metas === 'object' || typeof metas === 'function')) {
            var def = defCache.get(metas);
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
    var def = getDef(metas);
    var value;
    if (def.token !== undefined) {
        value = mode === ResolveMode.Async
            ? (0, registry_1.ɵɵInjectAsync)(def.token, def.flags)
            : (0, registry_1.ɵɵInject)(def.token, def.flags);
    }
    if (def.transforms) {
        if (mode === ResolveMode.Async && value instanceof Promise) {
            value = value.then(function (v) { return applyTransforms(def.transforms, executor, context, v); });
        }
        else {
            value = applyTransforms(def.transforms, executor, context, value);
        }
    }
    return value;
}
function applyTransforms(transforms, executor, context, value) {
    var e_1, _a;
    try {
        for (var transforms_1 = tslib_1.__values(transforms), transforms_1_1 = transforms_1.next(); !transforms_1_1.done; transforms_1_1 = transforms_1.next()) {
            var transformMeta = transforms_1_1.value;
            value = executor(context, transformMeta.transform, transformMeta, value);
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
var paramExecutor = function (args, t, m, v) { return t.apply(void 0, tslib_1.__spreadArray([m, v], tslib_1.__read(args), false)); };
function resolveParams(deps, args, mode) {
    if (args === void 0) { args = []; }
    if (mode === void 0) { mode = ResolveMode.Sync; }
    var len = deps.length;
    var result = new Array(len);
    for (var i = 0; i < len; i++) {
        var dep = deps[i];
        if (Array.isArray(dep)) {
            result[i] = resolveValue(dep, paramExecutor, args, mode);
        }
        else {
            result[i] = mode === ResolveMode.Async ? (0, registry_1.ɵɵInjectAsync)(dep, 0) : (0, registry_1.ɵɵInject)(dep, 0);
        }
    }
    return result;
}
var propExecutor = function (ctx, t, m, v) { return t(m, v, ctx.target, ctx.key); };
function resolveProps(target, props, mode) {
    if (mode === void 0) { mode = ResolveMode.Sync; }
    if (mode === ResolveMode.Async) {
        var promises = [];
        var _loop_1 = function (key) {
            var v = resolveValue(props[key], propExecutor, { target: target, key: key }, mode);
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
            var value = resolveValue(props[key], propExecutor, { target: target, key: key }, mode);
            if (value !== target[key])
                target[key] = value;
        }
        return target;
    }
}
