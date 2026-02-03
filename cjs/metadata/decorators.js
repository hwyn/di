"use strict";
/**
 * @file meta/decorators.ts
 * @description Defines the core decorator factories for creating annotations (like @Injectable, @Inject).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePropDecorator = exports.DI_DECORATOR_FLAG = exports.FORWARD_REF = exports.IS_PROXY = exports.RESOLVED_META = exports.PROP_METADATA = exports.NATIVE_METHOD = exports.METHODS = exports.PARAMETERS = exports.ANNOTATIONS = void 0;
exports.makeDecorator = makeDecorator;
exports.makeParamDecorator = makeParamDecorator;
exports.makeMethodDecorator = makeMethodDecorator;
exports.markInject = markInject;
exports.getInjectFlag = getInjectFlag;
exports.forwardRef = forwardRef;
var tslib_1 = require("tslib");
var hasOwn = Object.prototype.hasOwnProperty;
exports.ANNOTATIONS = '__annotations__';
exports.PARAMETERS = '__parameters__';
exports.METHODS = '__methods__';
exports.NATIVE_METHOD = '__native__method__';
exports.PROP_METADATA = '__prop__metadata__';
exports.RESOLVED_META = Symbol('__di_resolved__');
exports.IS_PROXY = Symbol('__di_is_proxy__');
exports.FORWARD_REF = '__forward__ref__';
exports.DI_DECORATOR_FLAG = '__DI_FLAG__';
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
        var values = props.apply(void 0, tslib_1.__spreadArray([], tslib_1.__read(args), false));
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
        var annotationInstance = new ((_a = Factory).bind.apply(_a, tslib_1.__spreadArray([void 0], tslib_1.__read(args), false)))();
        return function Decorator(target, key, descriptor) {
            return adapter(annotationInstance, args, target, key, descriptor);
        };
    }
    Factory.prototype.metadataName = name;
    Factory.annotationCls = Factory;
    return Factory;
}
function makeDecorator(name, props, typeFn) {
    function TypeDecorator(instance, args, cls) {
        getPropertyValue(cls, exports.ANNOTATIONS).push(instance);
        typeFn === null || typeFn === void 0 ? void 0 : typeFn(cls, { metadata: instance, args: args });
        return cls;
    }
    return makeMetadataFactory(name, props, TypeDecorator);
}
function makeParamDecorator(name, props, typeFn) {
    function ParamDecorator(instance, args, target, propertyKey, indexOrDescriptor) {
        var isParam = typeof indexOrDescriptor === 'number';
        var cls = propertyKey ? target.constructor : target;
        var metadata = isParam
            ? { method: propertyKey || 'constructor', index: indexOrDescriptor, annotationInstance: instance }
            : { prop: propertyKey, descriptor: indexOrDescriptor, annotationInstance: instance };
        getPropertyValue(cls, isParam ? exports.PARAMETERS : exports.PROP_METADATA).unshift(metadata);
        typeFn === null || typeFn === void 0 ? void 0 : typeFn(cls, propertyKey, indexOrDescriptor, { metadata: instance, args: args });
    }
    return makeMetadataFactory(name, props, ParamDecorator);
}
function makeMethodDecorator(name, props, typeFn) {
    function MethodDecorator(instance, args, target, method, descriptor) {
        var cls = target.constructor;
        var nativeMethods = getPropertyValue(cls, exports.NATIVE_METHOD, false);
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
        getPropertyValue(cls, exports.METHODS).push({ method: method, descriptor: descriptor, annotationInstance: instance });
        typeFn === null || typeFn === void 0 ? void 0 : typeFn(cls, method, descriptor, { metadata: instance, args: args });
    }
    return makeMetadataFactory(name, props, MethodDecorator);
}
exports.makePropDecorator = makeParamDecorator;
function markInject(target, flag) {
    target[exports.DI_DECORATOR_FLAG] = flag;
    var proto = target.prototype;
    if (proto)
        proto[exports.DI_DECORATOR_FLAG] = flag;
    return target;
}
function getInjectFlag(token) {
    return token && token[exports.DI_DECORATOR_FLAG];
}
function forwardRef(fn) {
    return markInject(fn, exports.FORWARD_REF);
}