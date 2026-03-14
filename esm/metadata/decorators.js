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
/**
 * Creates a class decorator factory.
 *
 * The returned function, when called with arguments, produces a class decorator that:
 * 1. Creates an annotation instance via `props(...)` and stores it in the class's `__annotations__` array.
 * 2. Optionally calls `typeFn(cls, { metadata, args })` for side-effects (e.g. registering the class).
 *
 * @typeParam M - Tuple type of the decorator's arguments.
 * @typeParam T - The expected class instance type (used for type-checking decorated classes).
 * @param name - The decorator name, stored as `metadataName` on each annotation instance.
 * @param props - Optional function that maps decorator arguments to annotation properties.
 * @param typeFn - Optional callback invoked at decoration time for side-effects.
 * @returns A decorator factory function: `(...args: M) => ClassDecorator`.
 *
 * @example
 * ```ts
 * const Feature = makeDecorator('Feature',
 *   (name: string) => ({ name }),
 *   (type) => setInjectableDef(type)
 * );
 *
 * @Feature('auth')
 * class AuthService { ... }
 * ```
 */
export function makeDecorator(name, props, typeFn) {
    function TypeDecorator(instance, args, cls) {
        getPropertyValue(cls, ANNOTATIONS).push(instance);
        typeFn === null || typeFn === void 0 ? void 0 : typeFn(cls, { metadata: instance, args });
        return cls;
    }
    return makeMetadataFactory(name, props, TypeDecorator);
}
/**
 * Creates a parameter/property decorator factory.
 *
 * The returned function, when called with arguments, produces a decorator applicable to
 * both constructor/method parameters and class properties:
 * - **Parameter**: Stores in `__parameters__` with method name, index, and annotation.
 * - **Property**: Stores in `__prop__metadata__` with property name and annotation.
 *
 * The DI system reads these via `Reflector.resolveParameterAnnotations()` and
 * `Reflector.resolvePropertyAnnotations()` to build dependency definitions.
 *
 * @typeParam M - Tuple type of the decorator's arguments.
 * @param name - The decorator name, stored as `metadataName` on each annotation instance.
 * @param props - Optional function that maps decorator arguments to annotation properties.
 * @param typeFn - Optional callback invoked at decoration time for side-effects.
 * @returns A decorator factory function: `(...args: M) => ParameterDecorator & PropertyDecorator`.
 *
 * @example
 * ```ts
 * const Tag = makeParamDecorator('Tag',
 *   (label: string) => ({ label })
 * );
 *
 * class Service {
 *   @Tag('primary') name!: string;
 * }
 * ```
 */
export function makeParamDecorator(name, props, typeFn) {
    function ParamDecorator(instance, args, target, propertyKey, indexOrDescriptor) {
        const isParam = typeof indexOrDescriptor === 'number';
        const cls = propertyKey ? target.constructor : target;
        const metadata = isParam
            ? { method: propertyKey || 'constructor', index: indexOrDescriptor, annotationInstance: instance }
            : { prop: propertyKey, descriptor: indexOrDescriptor, annotationInstance: instance };
        getPropertyValue(cls, isParam ? PARAMETERS : PROP_METADATA).unshift(metadata);
        typeFn === null || typeFn === void 0 ? void 0 : typeFn(cls, propertyKey, indexOrDescriptor, { metadata: instance, args });
    }
    return makeMetadataFactory(name, props, ParamDecorator);
}
/**
 * Creates a method decorator factory.
 *
 * The returned function, when called with arguments, produces a method decorator that:
 * 1. Wraps the original method so it can be transparently intercepted by the DI system.
 * 2. Stores the annotation in the class's `__methods__` array.
 * 3. Optionally calls `typeFn` for side-effects.
 *
 * Use `Reflector.resolveMethodAnnotations(type, methodName)` to retrieve method annotations.
 *
 * @typeParam M - Tuple type of the decorator's arguments.
 * @param name - The decorator name, stored as `metadataName` on each annotation instance.
 * @param props - Optional function that maps decorator arguments to annotation properties.
 * @param typeFn - Optional callback invoked at decoration time (receives class, method name, descriptor).
 * @returns A decorator factory function: `(...args: M) => MethodDecorator`.
 *
 * @example
 * ```ts
 * const Hook = makeMethodDecorator('Hook',
 *   (event: string) => ({ event })
 * );
 *
 * class Service {
 *   @Hook('init')
 *   onInit() { ... }
 * }
 * ```
 */
export function makeMethodDecorator(name, props, typeFn) {
    function MethodDecorator(instance, args, target, method, descriptor) {
        const cls = target.constructor;
        const nativeMethods = getPropertyValue(cls, NATIVE_METHOD, false);
        if (!hasOwn.call(nativeMethods, method)) {
            nativeMethods[method] = descriptor.value;
            descriptor.value = function (...args) { return nativeMethods[method].apply(this, args); };
        }
        getPropertyValue(cls, METHODS).push({ method, descriptor, annotationInstance: instance });
        typeFn === null || typeFn === void 0 ? void 0 : typeFn(cls, method, descriptor, { metadata: instance, args });
    }
    return makeMetadataFactory(name, props, MethodDecorator);
}
/**
 * Alias for {@link makeParamDecorator}.
 *
 * Semantically indicates that the decorator is intended for properties,
 * though both parameter and property positions are supported.
 */
export const makePropDecorator = makeParamDecorator;
/**
 * Marks a decorator factory with an internal DI flag.
 *
 * Attaches a numeric flag (from {@link DecoratorFlags}) to both the factory function
 * and its prototype. The DI resolver reads this flag to distinguish between
 * Inject-type decorators (`@Inject`) and Pipeline-type decorators (defined by
 * consuming frameworks) during dependency compilation.
 *
 * @typeParam T - The type of the decorator factory.
 * @param target - The decorator factory function to mark.
 * @param flag - The flag value (typically `DecoratorFlags.Inject` or `DecoratorFlags.Pipeline`).
 * @returns The same `target`, now marked with the flag.
 */
export function markInject(target, flag) {
    target[DI_DECORATOR_FLAG] = flag;
    const proto = target.prototype;
    if (proto)
        proto[DI_DECORATOR_FLAG] = flag;
    return target;
}
/**
 * Retrieves the internal DI flag from a token or decorator factory.
 *
 * Returns the flag value previously set by {@link markInject}, or `undefined`
 * if the token has no DI flag. Used internally during dependency compilation.
 *
 * @typeParam T - The expected flag type (defaults to `number`).
 * @param token - The token, decorator, or annotation to inspect.
 * @returns The flag value, or `undefined` if none.
 */
export function getInjectFlag(token) {
    return token && token[DI_DECORATOR_FLAG];
}
/**
 * Creates a forward reference to resolve circular declaration-order dependencies.
 *
 * Wraps a function that returns a token, deferring its evaluation until the DI system
 * actually needs it. This breaks circular dependency chains between files or classes
 * that reference each other at decoration time.
 *
 * @param fn - A function that returns the actual injection token.
 * @returns A wrapped token that the DI system resolves lazily.
 *
 * @example
 * ```ts
 * @Injectable()
 * class ServiceA {
 *   // ServiceB is declared after ServiceA, so use forwardRef
 *   constructor(@Inject(forwardRef(() => ServiceB)) private b: ServiceB) {}
 * }
 *
 * @Injectable()
 * class ServiceB {
 *   constructor(@Inject(ServiceA) private a: ServiceA) {}
 * }
 * ```
 */
export function forwardRef(fn) {
    return markInject(fn, FORWARD_REF);
}