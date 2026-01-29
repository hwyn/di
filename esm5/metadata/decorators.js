/**
 * @file meta/decorators.ts
 * @description Defines the core decorator factories for creating annotations (like @Injectable, @Inject).
 */
import { __read, __spreadArray } from "tslib";
var hasOwn = Object.prototype.hasOwnProperty;
export var ANNOTATIONS = '__annotations__';
export var PARAMETERS = '__parameters__';
export var METHODS = '__methods__';
export var NATIVE_METHOD = '__native__method__';
export var PROP_METADATA = '__prop__metadata__';
export var RESOLVED_META = Symbol('__di_resolved__');
export var IS_PROXY = Symbol('__di_is_proxy__');
export var FORWARD_REF = '__forward__ref__';
export var DI_DECORATOR_FLAG = '__DI_FLAG__';
function getPropertyValue(target, property, isArray) {
    if (isArray === void 0) { isArray = true; }
    if (hasOwn.call(target, property))
        return target[property];
    var value = isArray ? [] : {};
    Object.defineProperty(target, property, { value: value, enumerable: false, writable: true, configurable: true });
    return value;
}
function makeMetadataCtor(props) {
    if (!props)
        return function ctor() { };
    return function ctor() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var values = props.apply(void 0, __spreadArray([], __read(args), false));
        if (values)
            Object.assign(this, values);
    };
}
function makeMetadataFactory(name, props, adapter) {
    var metaCtor = makeMetadataCtor(props);
    function Factory() {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this instanceof Factory)
            return metaCtor.apply(this, args);
        var annotationInstance = new ((_a = Factory).bind.apply(_a, __spreadArray([void 0], __read(args), false)))();
        return function Decorator(target, key, descriptor) {
            return adapter(annotationInstance, args, target, key, descriptor);
        };
    }
    Factory.prototype.metadataName = name;
    Factory.annotationCls = Factory;
    return Factory;
}
export function makeDecorator(name, props, typeFn) {
    function TypeDecorator(instance, args, cls) {
        getPropertyValue(cls, ANNOTATIONS).push(instance);
        typeFn === null || typeFn === void 0 ? void 0 : typeFn.apply(void 0, __spreadArray([cls], __read(args), false));
        return cls;
    }
    return makeMetadataFactory(name, props, TypeDecorator);
}
export function makeParamDecorator(name, props, typeFn) {
    function ParamDecorator(instance, args, target, propertyKey, indexOrDescriptor) {
        var isParam = typeof indexOrDescriptor === 'number';
        var cls = propertyKey ? target.constructor : target;
        var metadata = isParam
            ? { method: propertyKey || 'constructor', index: indexOrDescriptor, annotationInstance: instance }
            : { prop: propertyKey, descriptor: indexOrDescriptor, annotationInstance: instance };
        getPropertyValue(cls, isParam ? PARAMETERS : PROP_METADATA).unshift(metadata);
        typeFn === null || typeFn === void 0 ? void 0 : typeFn.apply(void 0, __spreadArray([cls, propertyKey, indexOrDescriptor], __read(args), false));
    }
    return makeMetadataFactory(name, props, ParamDecorator);
}
export function makeMethodDecorator(name, props, typeFn) {
    function MethodDecorator(instance, args, target, method, descriptor) {
        var cls = target.constructor;
        var nativeMethods = getPropertyValue(cls, NATIVE_METHOD, false);
        if (!hasOwn.call(nativeMethods, method)) {
            nativeMethods[method] = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return nativeMethods[method].apply(this, args);
            };
        }
        getPropertyValue(cls, METHODS).push({ method: method, descriptor: descriptor, annotationInstance: instance });
        typeFn === null || typeFn === void 0 ? void 0 : typeFn.apply(void 0, __spreadArray([cls, method, descriptor], __read(args), false));
    }
    return makeMetadataFactory(name, props, MethodDecorator);
}
export var makePropDecorator = makeParamDecorator;
export function markInject(target, flag) {
    target[DI_DECORATOR_FLAG] = flag;
    var proto = target.prototype;
    if (proto)
        proto[DI_DECORATOR_FLAG] = flag;
    return target;
}
export function getInjectFlag(token) {
    return token && token[DI_DECORATOR_FLAG];
}
export function forwardRef(fn) {
    return markInject(fn, FORWARD_REF);
}