import { InjectorToken } from '../metadata';
/**
 * Configuration options for a registry scope.
 *
 * Controls whether a scope accepts multiple values and whether existing values
 * can be overwritten.
 */
export interface ScopeOptions {
    /** If `true`, the scope accepts multiple registered values (default). If `false`, only one value is allowed. */
    multi?: boolean;
    /** If `true`, allows overwriting the existing value in a single-value scope. Ignored when `multi` is `true`. */
    allowOverride?: boolean;
}
/**
 * A typed scope handle returned by `TokenRegistry.createScope()`.
 *
 * Extends `InjectorToken` with scope-level options and a phantom type guard
 * so that `register()`, `getOne()`, and `getAll()` are type-safe.
 *
 * @typeParam T - The type of values stored under this scope.
 */
export type RegistryScope<T> = InjectorToken & {
    readonly _typeGuard?: T;
    readonly options: ScopeOptions;
};
/** A value or arbitrarily nested array of values accepted by `TokenRegistry.register()`. */
export type RegistryInput<T> = T | RegistryInput<T>[];
/**
 * Global, scope-grouped value registry.
 *
 * `TokenRegistry` organises arbitrary values into named scopes. Each scope is
 * created with `createScope()` and can be configured as single-value or
 * multi-value. Values are registered with `register()` and retrieved with
 * `getOne()` / `getAll()`.
 *
 * All public operations are exposed as **static** methods that delegate to a
 * module-level singleton, so no injector is needed to use the registry.
 * The class is also `@Injectable` so it can be injected where an instance
 * reference is preferred.
 *
 * Results are cached after the first read; subsequent `register()` calls
 * invalidate the cache automatically.
 *
 * @example
 * ```ts
 * // 1. Define a scope
 * const PLUGINS = TokenRegistry.createScope<PluginDef>('PLUGINS');
 *
 * // 2. Register values (may be nested arrays)
 * TokenRegistry.register(PLUGINS, [pluginA, pluginB]);
 *
 * // 3. Retrieve
 * const all = TokenRegistry.getAll(PLUGINS);   // ReadonlyArray<PluginDef>
 * const one = TokenRegistry.getOne(PLUGINS);   // last registered value
 * ```
 */
export declare class TokenRegistry {
    /**
     * Creates a new typed scope handle.
     *
     * @typeParam T - The type of values stored under this scope.
     * @param desc - Human-readable description (used by `InjectorToken.get()`).
     * @param options - Scope configuration. Defaults to `{ multi: true, allowOverride: false }`.
     * @returns A `RegistryScope<T>` handle for use with `register` / `getOne` / `getAll`.
     */
    static createScope<T>(desc: string, options?: ScopeOptions): RegistryScope<T>;
    /**
     * Registers one or more values into a scope.
     *
     * Accepts a single value or an arbitrarily nested array. For single-value
     * scopes (`multi: false`), passing an array or registering twice without
     * `allowOverride` throws.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle created by `createScope()`.
     * @param items - Value(s) to register.
     */
    static register<T>(scope: RegistryScope<T>, items: RegistryInput<T>): void;
    /**
     * Returns the last registered value for the given scope, or `undefined` if empty.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle.
     */
    static getOne<T>(scope: RegistryScope<T>): T | undefined;
    /**
     * Returns all registered values for the given scope as a frozen array.
     *
     * Results are deduplicated and cached until the next `register()` call.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle.
     * @returns A `ReadonlyArray<T>` (may be empty).
     */
    static getAll<T>(scope: RegistryScope<T>): ReadonlyArray<T>;
    /**
     * Removes a scope and all its registered values.
     *
     * @param scope - The scope handle to delete.
     */
    static deleteScope(scope: RegistryScope<unknown>): void;
    /**
     * Marks a scope as defined so that `register()` will accept it.
     *
     * Called automatically by `createScope()`. Only needed when setting up a
     * scope on a non-default `TokenRegistry` instance.
     *
     * @param scope - The scope handle to define.
     */
    defineScope(scope: RegistryScope<unknown>): void;
    private _scopes;
    private _chunks;
    private _cache;
    /**
     * Registers value(s) into a previously defined scope.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle (must have been defined via `defineScope` or `createScope`).
     * @param items - Value(s) to store.
     * @throws If the scope is not defined, or violates single-value / override constraints.
     */
    register<T>(scope: RegistryScope<T>, items: RegistryInput<T>): void;
    /**
     * Returns the last registered value, or `undefined` if the scope is empty.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle.
     */
    getOne<T>(scope: RegistryScope<T>): T | undefined;
    /**
     * Returns all registered values as a frozen, deduplicated array.
     *
     * Caches the result until the next `register()` call on this scope.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle.
     * @returns A `ReadonlyArray<T>` (empty frozen array if nothing was registered).
     */
    getAll<T>(scope: RegistryScope<T>): ReadonlyArray<T>;
    /**
     * Removes a scope and all associated data (chunks + cache).
     *
     * @param scope - The scope handle to delete.
     */
    deleteScope(scope: RegistryScope<unknown>): void;
    /** Alias for {@link deleteScope}. Removes the scope and all its data. */
    clear(scope: RegistryScope<unknown>): void;
    /** @internal Returns diagnostic info for each registered scope (for debugging). */
    _debug(): {
        scope: string;
        writeOps: number;
        hasCache: boolean;
    }[];
}
