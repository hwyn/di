import { __spreadArray } from "tslib";
var FORWARD_REF = '__forward__ref__';
var DI_DECORATOR_FLAG = '__DI_FLAG__';
var injector = null;
export function saveCurrentInjector(_inject) {
    var preInjector = injector;
    injector = _inject;
    return preInjector;
}
export function getCurrentInjector() {
    return injector;
}
export function attachInjectFlag(decorator, flag) {
    decorator[DI_DECORATOR_FLAG] = flag;
    if (decorator.prototype) {
        decorator.prototype[DI_DECORATOR_FLAG] = flag;
    }
    return decorator;
}
export function getInjectFlag(token) {
    return token[DI_DECORATOR_FLAG];
}
export function forwardRef(ref) {
    return attachInjectFlag(ref, FORWARD_REF);
}
export function ɵɵInject(token, flags) {
    return injector === null || injector === void 0 ? void 0 : injector.get(typeof token === 'function' && getInjectFlag(token) === FORWARD_REF ? token() : token, flags);
}
function factoryMetaToValue(_transform, tokeFlags) {
    return function (metaList, handler) {
        var flags = 0;
        var token = undefined;
        var metaCache = [];
        metaList.forEach(function (meta) {
            var flag = getInjectFlag(meta);
            metaCache.push([meta.transform || _transform, meta]);
            if (typeof flag !== 'number')
                return token = meta;
            flag === tokeFlags ? token = meta.token : flags = flags | flag;
        });
        var value = ɵɵInject(token, flags);
        while (metaCache.length) {
            var _a = metaCache.pop(), transformFunc = _a[0], meta = _a[1];
            value = handler(transformFunc, meta, value);
        }
        return value;
    };
}
var argsMetaToValue = factoryMetaToValue(function (_meta, value) { return value; }, -1 /* DecoratorFlags.Inject */);
export function injectArgs(types) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var handler = function (transform, meta, value) { return transform.apply(void 0, __spreadArray([meta, value], args, false)); };
    return types.map(function (arg) { return argsMetaToValue(Array.isArray(arg) ? arg : [arg], handler); });
}
export function propArgs(type, propMetadata) {
    Object.keys(propMetadata).forEach(function (prop) {
        var handler = function (transform, meta, value) { return transform(meta, value, type, prop); };
        var value = argsMetaToValue(propMetadata[prop], handler);
        value !== type[prop] && (type[prop] = value);
    });
    return type;
}
