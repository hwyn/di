import type { Type, TokenKey } from './types';
export type { Type, TypeClass, AbstractType, TokenKey, ForwardRefFn, ScopeId, InjectableDef, AnnotationMeta, PropMetadataMap, DependencyDef } from './types';
/**
 * Base interface for all provider definitions.
 *
 * Every provider must specify a `provide` token that the injector uses as a lookup key.
 * Optional fields control multi-value collection, environment isolation, and visibility.
 *
 * @typeParam T - The type of value this provider produces.
 */
export interface AbstractProvider<T = any> {
    /** The injection token this provider is registered under. */
    provide: TokenKey;
    /** If `true`, multiple providers for the same token are collected into an array. */
    multi?: boolean;
    /** Environment tag for multi-environment isolation (e.g. 'server', 'client'). */
    env?: string;
    /** If `true`, this provider is only visible within the injector it's registered in (not inherited by children). */
    private?: boolean;
}
/**
 * Provider base that supports explicit dependency declarations.
 *
 * When `deps` is specified, the DI system injects the listed tokens as arguments
 * to the factory or constructor, bypassing automatic parameter annotation resolution.
 *
 * @typeParam T - The type of value this provider produces.
 */
export interface AbstractProviderWithDeps<T = any> extends AbstractProvider<T> {
    /** Explicit list of injection tokens to resolve and pass as arguments. */
    deps?: TokenKey[];
}
/**
 * Provider that aliases one token to another.
 *
 * When this token is requested, the injector resolves `useExisting` instead.
 * Useful for providing an abstract class or interface token that delegates to a concrete implementation.
 *
 * @typeParam T - The type of value this provider produces.
 *
 * @example
 * ```ts
 * { provide: Logger, useExisting: ConsoleLogger }
 * ```
 */
export interface ExistingProvider<T = any> extends AbstractProvider<T> {
    /** The token to resolve instead of creating a new instance. */
    useExisting: TokenKey;
}
/**
 * Provider that instantiates a specific class.
 *
 * The injector creates an instance of `useClass`, auto-resolving its constructor dependencies.
 * If `deps` is specified, those tokens are used instead of automatic parameter resolution.
 *
 * @typeParam T - The type of instance this provider produces.
 *
 * @example
 * ```ts
 * { provide: Logger, useClass: FileLogger }
 * { provide: Logger, useClass: FileLogger, deps: [ConfigService] }
 * ```
 */
export interface ClassProvider<T = any> extends AbstractProviderWithDeps<T> {
    /** The class to instantiate when this token is requested. */
    useClass: Type<T>;
}
/**
 * Provider where the `provide` token is itself a class constructor.
 *
 * Equivalent to `{ provide: MyClass, useClass: MyClass }`. The injector instantiates
 * the class directly. Use `deps` to override automatic dependency resolution.
 *
 * @typeParam T - The type of instance this provider produces.
 *
 * @example
 * ```ts
 * { provide: MyService, deps: [Logger, ConfigService] }
 * ```
 */
export interface ConstructorProvider<T = any> extends AbstractProviderWithDeps<T> {
    /** Must be a class constructor. */
    provide: Type<T>;
}
/**
 * Provider that supplies a pre-existing value.
 *
 * No instantiation or factory invocation occurs; the injector returns `useValue` directly.
 * Ideal for configuration objects, constants, and pre-built instances.
 *
 * @typeParam T - The type of value this provider supplies.
 *
 * @example
 * ```ts
 * { provide: API_URL, useValue: 'https://api.example.com' }
 * { provide: APP_CONFIG, useValue: { debug: true, version: '1.0' } }
 * ```
 */
export interface ValueProvider<T = any> extends AbstractProvider<T> {
    /** The value to return when this token is requested. */
    useValue: T;
}
/**
 * Provider that calls a factory function to produce the value.
 *
 * When `deps` is specified, the listed tokens are resolved and passed as arguments.
 * The factory can return a Promise for async initialization.
 *
 * @typeParam T - The type of value the factory produces.
 *
 * @example
 * ```ts
 * { provide: CONFIG_TOKEN, useFactory: (env: EnvService) => env.loadConfig(), deps: [EnvService] }
 * { provide: LOGGER, useFactory: () => new ConsoleLogger() }
 * ```
 */
export interface FactoryProvider<T = any> extends AbstractProviderWithDeps<T> {
    /** Factory function that produces the value. Arguments come from `deps`. */
    useFactory: (...args: any[]) => T;
}
/**
 * Union of all provider definition types accepted by `Injector.create()` and `injector.set()`.
 *
 * - {@link ValueProvider} — Supply a pre-existing value.
 * - {@link ClassProvider} — Instantiate a class.
 * - {@link FactoryProvider} — Call a factory function.
 * - {@link ExistingProvider} — Alias to another token.
 * - {@link ConstructorProvider} — Class as both token and implementation.
 * - `Type` — Shorthand for `{ provide: MyClass, useClass: MyClass }`.
 * - `Provider[]` — Nested arrays are flattened automatically.
 *
 * @example
 * ```ts
 * Injector.create([
 *   MyService,                                          // Type shorthand
 *   { provide: Logger, useClass: ConsoleLogger },       // ClassProvider
 *   { provide: API_URL, useValue: '/api' },             // ValueProvider
 *   { provide: CACHE, useFactory: (cfg: ConfigService) => new CacheService(cfg), deps: [ConfigService] }, // FactoryProvider
 * ]);
 * ```
 */
export declare type Provider = ValueProvider | ExistingProvider | ClassProvider | ConstructorProvider | FactoryProvider | Type | Provider[];
