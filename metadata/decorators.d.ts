import { TokenKey, Type, ForwardRefFn } from './provider';
export declare const ANNOTATIONS = "__annotations__";
export declare const PARAMETERS = "__parameters__";
export declare const METHODS = "__methods__";
export declare const NATIVE_METHOD = "__native__method__";
export declare const PROP_METADATA = "__prop__metadata__";
export declare const RESOLVED_META: unique symbol;
export declare const IS_PROXY: unique symbol;
export declare const FORWARD_REF = "__forward__ref__";
export declare const DI_DECORATOR_FLAG = "__DI_FLAG__";
export type ClassDecorator<N> = <T extends Function>(target: T) => T | void;
export type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
export type TargetDecorator = ParameterDecorator & PropertyDecorator;
export type MetadataTypeFn = (type: Type, ...args: any[]) => void;
export type MetadataProps<M extends unknown[]> = (...args: M) => object | void;
export type MetadataFactoryAdapter<M> = (instance: any, args: M, target: any, key?: string | symbol, descriptor?: PropertyDescriptor | number) => void;
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
export declare function makeDecorator<M extends unknown[] = [], T = any>(name: string, props?: MetadataProps<M>, typeFn?: MetadataTypeFn): (...args: M) => ClassDecorator<T>;
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
export declare function makeParamDecorator<M extends unknown[] = []>(name: string, props?: MetadataProps<M>, typeFn?: MetadataTypeFn): (...args: M) => TargetDecorator;
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
export declare function makeMethodDecorator<M extends unknown[] = []>(name: string, props?: MetadataProps<M>, typeFn?: MetadataTypeFn): (...args: M) => MethodDecorator;
/**
 * Alias for {@link makeParamDecorator}.
 *
 * Semantically indicates that the decorator is intended for properties,
 * though both parameter and property positions are supported.
 */
export declare const makePropDecorator: typeof makeParamDecorator;
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
export declare function markInject<T>(target: T, flag: number): T;
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
export declare function getInjectFlag<T = number>(token: unknown): T | undefined;
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
export declare function forwardRef(fn: ForwardRefFn): TokenKey;
