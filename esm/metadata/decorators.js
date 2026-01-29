/**
 * @file meta/decorators.ts
 * @description Defines the core decorator factories for creating annotations (like @Injectable, @Inject).
 */
const hasOwn = Object.prototype.hasOwnProperty;
export const ANNOTATIONS = '__annotations__';
export const PARAMETERS = '__parameters__';
export const METHODS = '__methods__';
export const NATIVE_METHOD = '__native__method__';
export const PROP_METADATA = '__prop__metadata__';
export const RESOLVED_META = Symbol('__di_resolved__');
export const IS_PROXY = Symbol('__di_is_proxy__');
export const FORWARD_REF = '__forward__ref__';
export const DI_DECORATOR_FLAG = '__DI_FLAG__';
function getPropertyValue(target, property, isArray = true) {
    if (hasOwn.call(target, property))
        return target[property];
    const value = isArray ? [] : {};
    Object.defineProperty(target, property, { value, enumerable: false, writable: true, configurable: true });
    return value;
}
function makeMetadataCtor(props) {
    if (!props)
        return function ctor() { };
    return function ctor(...args) {
        const values = props(...args);
        if (values)
            Object.assign(this, values);
    };
}
function makeMetadataFactory(name, props, adapter) {
    const metaCtor = makeMetadataCtor(props);
    function Factory(...args) {
        if (this instanceof Factory)
            return metaCtor.apply(this, args);
        const annotationInstance = new Factory(...args);
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
        typeFn === null || typeFn === void 0 ? void 0 : typeFn(cls, ...args);
        return cls;
    }
    return makeMetadataFactory(name, props, TypeDecorator);
}
export function makeParamDecorator(name, props, typeFn) {
    function ParamDecorator(instance, args, target, propertyKey, indexOrDescriptor) {
        const isParam = typeof indexOrDescriptor === 'number';
        const cls = propertyKey ? target.constructor : target;
        const metadata = isParam
            ? { method: propertyKey || 'constructor', index: indexOrDescriptor, annotationInstance: instance }
            : { prop: propertyKey, descriptor: indexOrDescriptor, annotationInstance: instance };
        getPropertyValue(cls, isParam ? PARAMETERS : PROP_METADATA).unshift(metadata);
        typeFn === null || typeFn === void 0 ? void 0 : typeFn(cls, propertyKey, indexOrDescriptor, ...args);
    }
    return makeMetadataFactory(name, props, ParamDecorator);
}
export function makeMethodDecorator(name, props, typeFn) {
    function MethodDecorator(instance, args, target, method, descriptor) {
        const cls = target.constructor;
        const nativeMethods = getPropertyValue(cls, NATIVE_METHOD, false);
        if (!hasOwn.call(nativeMethods, method)) {
            nativeMethods[method] = descriptor.value;
            descriptor.value = function (...args) { return nativeMethods[method].apply(this, args); };
        }
        getPropertyValue(cls, METHODS).push({ method, descriptor, annotationInstance: instance });
        typeFn === null || typeFn === void 0 ? void 0 : typeFn(cls, method, descriptor, ...args);
    }
    return makeMetadataFactory(name, props, MethodDecorator);
}
export const makePropDecorator = makeParamDecorator;
export function markInject(target, flag) {
    target[DI_DECORATOR_FLAG] = flag;
    const proto = target.prototype;
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