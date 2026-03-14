import { InjectorToken, Provider, TokenKey, Type } from '../metadata';
/**
 * The dependency injection container.
 *
 * An `Injector` is the central unit of the DI system. It holds provider registrations,
 * creates and caches instances, and manages their lifecycle (including disposal).
 *
 * Injectors form a hierarchy: if a token is not found in the current injector,
 * resolution delegates to the parent injector. This enables scoped services
 * (e.g. request-scoped, module-scoped).
 *
 * Create injectors with `Injector.create(providers, parent)`. In most applications,
 * injectors are created by the framework's bootstrap process.
 *
 * @example
 * ```ts
 * const injector = Injector.create([
 *   MyService,
 *   { provide: Logger, useClass: ConsoleLogger },
 *   { provide: API_URL, useValue: '/api' },
 * ]);
 *
 * const service = injector.get(MyService);
 * ```
 */
export declare abstract class Injector {
    /** Whether this injector has been destroyed. Destroyed injectors reject all requests. */
    readonly destroyed: boolean;
    /**
     * Synchronously resolves a dependency by its token.
     *
     * Looks up the token in this injector and its parent chain, creates the instance
     * if needed, caches it, and returns it. Throws if the token is not found
     * (unless `InjectFlags.Optional` is set).
     *
     * @typeParam T - The expected return type.
     * @param token - The injection token (class, InjectorToken, or abstract class).
     * @param flags - Optional bitwise flags: `InjectFlags.Optional`, `Self`, `SkipSelf`.
     * @returns The resolved instance.
     *
     * @example
     * ```ts
     * const logger = injector.get(Logger);
     * const config = injector.get(APP_CONFIG, InjectFlags.Optional); // null if missing
     * ```
     */
    abstract get<T>(token: Type<T>, flags?: number): T;
    abstract get<T>(token: InjectorToken<T>, flags?: number): T;
    abstract get<T = unknown>(token: TokenKey, flags?: number): T;
    abstract get<T = unknown>(token: any, flags?: number): T;
    /**
     * Asynchronously resolves a dependency by its token.
     *
     * Similar to `get()`, but supports async factory functions and async `onInit()` lifecycle.
     * Use this when dependencies require async initialization.
     *
     * @typeParam T - The expected return type.
     * @param token - The injection token.
     * @param flags - Optional bitwise flags.
     * @returns A Promise that resolves to the instance.
     *
     * @example
     * ```ts
     * const cache = await injector.getAsync(CacheService);
     * ```
     */
    abstract getAsync<T>(token: Type<T>, flags?: number): Promise<T>;
    abstract getAsync<T>(token: InjectorToken<T>, flags?: number): Promise<T>;
    abstract getAsync<T = unknown>(token: TokenKey, flags?: number): Promise<T>;
    abstract getAsync<T = unknown>(token: any, flags?: number): Promise<T>;
    /**
     * Registers a provider in this injector.
     *
     * If the provider has `multi: true`, it's added to a collection array.
     * Otherwise, it replaces any existing registration for the token.
     * Cannot overwrite a token that has already been instantiated.
     *
     * @param token - The injection token.
     * @param provider - The provider definition.
     */
    abstract set(token: any, provider: Provider): void;
    /**
     * Destroys this injector and all instances it has created.
     *
     * Calls `destroy()` on all disposable instances (those implementing `OnDestroy`),
     * triggers `onDispose` lifecycle hooks, and clears all internal caches.
     * After destruction, the injector rejects all subsequent requests.
     *
     * @returns A Promise if any disposal is async, otherwise void.
     */
    abstract destroy(): void | Promise<void>;
    static __prov_def__: {
        token: typeof Injector;
        factory: () => unknown;
    };
    /**
     * Creates a new Injector instance with the given providers and optional parent.
     *
     * The parent injector is used for fallback resolution: tokens not found in the
     * new injector will be looked up in the parent chain.
     *
     * @param providers - Array of provider definitions to register.
     * @param parent - Optional parent injector for hierarchical resolution.
     * @returns A new Injector instance.
     *
     * @example
     * ```ts
     * const root = Injector.create([GlobalService]);
     * const child = Injector.create([RequestService], root);
     * ```
     */
    static create: (providers?: Provider[] | null, parent?: Injector) => Injector;
}
