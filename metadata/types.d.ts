import { InjectorToken } from './injector-token';
import type { Injector } from '../registry/injector';
import type { Provider } from './provider';
/**
 * Represents an instantiable class constructor.
 *
 * Used throughout the DI system as the primary type for class-based injection tokens.
 * Any class that can be constructed with `new` satisfies this interface.
 *
 * @typeParam T - The instance type that the constructor produces.
 *
 * @example
 * ```ts
 * function createInstance<T>(type: Type<T>): T {
 *   return new type();
 * }
 * ```
 */
export declare interface Type<T = any> extends Function {
    new (...args: any[]): T;
}
/**
 * Extended class type that allows arbitrary static properties.
 *
 * Extends {@link Type} to permit index-based access to static members (e.g. `__annotations__`, `__order__`).
 * Used internally when the DI system reads or writes metadata properties on class constructors.
 *
 * @typeParam T - The instance type that the constructor produces.
 */
export declare interface TypeClass<T = any> extends Type<T> {
    [x: string]: any;
}
/**
 * Abstract class constructor type.
 *
 * Represents a class declared with the `abstract` keyword. Can be used as an injection token
 * but cannot be instantiated directly — a concrete subclass must be registered via a provider.
 *
 * @typeParam T - The instance type that concrete subclasses produce.
 *
 * @example
 * ```ts
 * abstract class Logger { abstract log(msg: string): void; }
 *
 * @Injectable()
 * class ConsoleLogger extends Logger {
 *   log(msg: string) { console.log(msg); }
 * }
 *
 * // Register: { provide: Logger, useClass: ConsoleLogger }
 * ```
 */
export declare type AbstractType<T = any> = abstract new (...args: any[]) => T;
/**
 * Union of all types that can serve as injection keys (tokens) in the DI system.
 *
 * - **Class** (`TypeClass`): Use the class constructor directly as a token.
 * - **InjectorToken**: Use `InjectorToken.get<T>('name')` for non-class values (strings, configs, interfaces).
 * - **AbstractType**: Use an abstract class as a token with a concrete implementation provider.
 *
 * @example
 * ```ts
 * // Class token
 * injector.get(MyService);
 *
 * // InjectorToken
 * const API_URL = InjectorToken.get<string>('API_URL');
 * injector.get(API_URL);
 *
 * // Abstract class token
 * injector.get(Logger); // resolves to registered concrete class
 * ```
 */
export declare type TokenKey = TypeClass | InjectorToken | AbstractType;
/**
 * A function that lazily resolves a not-yet-defined injection token.
 *
 * Used with {@link forwardRef} to break circular declaration order dependencies
 * between files or classes that reference each other.
 *
 * @example
 * ```ts
 * // ServiceA references ServiceB which hasn't been declared yet
 * @Injectable()
 * class ServiceA {
 *   constructor(@Inject(forwardRef(() => ServiceB)) private b: ServiceB) {}
 * }
 * ```
 */
export type ForwardRefFn = () => TokenKey;
/**
 * Scope identifier that controls where a service can be resolved.
 *
 * - `'root'` — Available in the root injector (default for `@Injectable()`).
 * - `string` — Available only in injectors created with a matching `INJECTOR_SCOPE`.
 * - `symbol` — Private scope marker (e.g. `IGNORE_SCOPE`).
 * - `null` — No scope constraint; the service is unscoped.
 */
export type ScopeId = string | symbol | null;
/**
 * Internal definition stored on a token after `@Injectable()` or `setInjectableDef()`.
 *
 * Contains the compiled factory function, scope constraint, and original provider options.
 * Typically not used directly by application code — prefer `@Injectable()` or `setInjectableDef()`.
 *
 * @typeParam T - The type of instance this definition produces.
 * @typeParam S - The scope identifier type (defaults to {@link ScopeId}).
 */
export interface InjectableDef<T, S = ScopeId> {
    /** Compiled factory function that creates the instance. Set automatically during resolution. */
    factory?: (ctx?: Injector) => T;
    /** Original provider options passed to `@Injectable()` or `setInjectableDef()`. */
    opt?: Provider | {
        scope?: S;
    };
    /** Scope in which this definition is valid. */
    scope?: S;
    /** The injection token this definition is associated with. */
    token: TokenKey;
    /** Environment tag for multi-environment isolation (e.g. 'server', 'client'). */
    env?: string;
}
/**
 * Base interface for a single metadata entry created by parameter/property decorators.
 *
 * Each decorator invocation (e.g. `@Inject(token)`, `@Optional()`) produces one `AnnotationMeta`
 * object that is stored on the class and later resolved by {@link Reflector}.
 *
 * The `metadataName` field identifies which decorator created this entry,
 * and `token` holds the injection token when applicable.
 * Additional fields are defined by each decorator's `props` function.
 *
 * Use `Reflector.resolveParameterAnnotations<T>()` or `Reflector.resolvePropertyAnnotations<T>()`
 * with a generic to access decorator-specific fields in a type-safe way.
 */
export interface AnnotationMeta {
    readonly [key: string]: unknown;
    /** The injection token associated with this annotation, if any. */
    readonly token?: TokenKey;
    /** The decorator name that created this annotation (e.g. 'Inject', 'Optional'). */
    readonly metadataName?: string;
}
/**
 * Map from property name to its decorator annotation metadata array.
 *
 * Produced by `Reflector.resolveProperties(type)`. Each key is a property name,
 * and the value is an array of all decorator annotations applied to that property,
 * merged along the prototype chain.
 */
export type PropMetadataMap = Record<string, AnnotationMeta[]>;
/**
 * Compiled dependency definition for a single constructor parameter or property.
 *
 * Produced internally by analyzing the decorator annotations on a parameter/property.
 * Combines the injection token, resolution flags (Optional, Self, SkipSelf),
 * and any Pipeline-flagged transform decorators (defined by consuming frameworks).
 */
export interface DependencyDef {
    /** The resolved injection token, or `undefined` if no token could be determined. */
    token: TokenKey | undefined;
    /** Bitwise flags combining {@link InjectFlags} (e.g. Optional | Self). */
    flags: number;
    /** Value-transform annotations from Pipeline-flagged decorators, applied sequentially after resolution. */
    transforms?: AnnotationMeta[];
}
/**
 * Metadata instance stored by class-level and method-level decorators.
 *
 * Every class decorator (e.g. `@Injectable()`) and method decorator
 * created via `makeMethodDecorator()` produces an `Annotation` object with a `metadataName` field
 * identifying the decorator, plus any additional properties defined by the decorator's `props` function.
 *
 * Use `Reflector.resolveClassAnnotation<T>(type, name)` or
 * `Reflector.resolveMethodAnnotations<T>(type, method, [name])` with a generic
 * to access decorator-specific fields type-safely.
 *
 * @example
 * ```ts
 * interface InjectableMeta extends Annotation {
 *   providedIn?: string;
 * }
 * const meta = Reflector.resolveClassAnnotation<InjectableMeta>(type, 'Injectable');
 * // meta.providedIn is typed as string | undefined
 * ```
 */
export interface Annotation {
    /** The decorator name that created this annotation (e.g. 'Injectable', 'Inject', 'Optional'). */
    metadataName: string;
    [key: string]: unknown;
}
/**
 * Raw entry stored by `makeMethodDecorator()` in the `__methods__` array on the class.
 *
 * Each method decorator invocation adds one entry. The {@link Reflector} reads these
 * entries and indexes them by method name for efficient lookup.
 */
export interface MethodMetadataEntry {
    /** The method name that was decorated. */
    method: string;
    /** The property descriptor of the decorated method. */
    descriptor: PropertyDescriptor;
    /** The annotation metadata object created by the decorator's `props` function. */
    annotationInstance: Annotation;
}
/**
 * Raw entry stored by `makeParamDecorator()` (parameter position) in the `__parameters__` array.
 *
 * Created when a parameter decorator like `@Inject(token)` is applied to a constructor
 * or method parameter. The {@link Reflector} groups these by method name and parameter index.
 */
export interface ParamMetadataEntry {
    /** The method name (or `'constructor'`) the parameter belongs to. */
    method: string;
    /** The zero-based parameter index. */
    index: number;
    /** The annotation metadata object created by the decorator's `props` function. */
    annotationInstance: AnnotationMeta;
}
/**
 * Raw entry stored by `makeParamDecorator()` (property position) in the `__prop__metadata__` array.
 *
 * Created when a parameter/property decorator like `@Inject(token)` is applied to a
 * class property. The {@link Reflector} groups these by property name.
 */
export interface PropMetadataEntry {
    /** The property name that was decorated. */
    prop: string;
    /** The property descriptor, if available. */
    descriptor?: PropertyDescriptor;
    /** The annotation metadata object created by the decorator's `props` function. */
    annotationInstance: AnnotationMeta;
}
/**
 * A single resolved constructor parameter dependency.
 *
 * Produced by `Reflector.resolveParameters(type)`. The array typically contains:
 * - `[0]` — The TypeScript design type (from `emitDecoratorMetadata`), if available.
 * - `[1..n]` — Any decorator annotations applied to this parameter (`@Inject`, `@Optional`, etc.).
 *
 * The DI resolver compiles this array into a {@link DependencyDef} to determine
 * the injection token, flags, and transforms.
 */
export type ParameterDependency = (Type | AnnotationMeta)[];
