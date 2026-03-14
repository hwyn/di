/**
 * Bitwise flags that control how the injector resolves a dependency.
 *
 * Flags can be combined: `InjectFlags.Optional | InjectFlags.Self`.
 *
 * @example
 * ```ts
 * injector.get(Logger, InjectFlags.Optional);              // null if not found
 * injector.get(Config, InjectFlags.Self);                  // current injector only
 * injector.get(Parent, InjectFlags.SkipSelf);              // parent injector only
 * injector.get(CacheService, InjectFlags.Optional | InjectFlags.Self); // combine
 * ```
 */
export declare enum InjectFlags {
    /** No special behavior — walks the full parent chain. */
    Default = 0,
    /** Returns `null` instead of throwing when the token is not found. */
    Optional = 1,
    /** Restricts lookup to the current injector only (no parent delegation). */
    Self = 2,
    /** Skips the current injector and resolves from the parent chain. */
    SkipSelf = 4,
    /** @internal Allows the resolver to return a Promise. */
    AllowAsync = 65536
}
/**
 * Determines whether a resolution runs synchronously or asynchronously.
 *
 * Used internally by the injector and exposed in `TransformContext`
 * so value transforms know the current resolution mode.
 */
export declare enum ResolveMode {
    /** Synchronous resolution via `injector.get()`. */
    Sync = 0,
    /** Asynchronous resolution via `injector.getAsync()`. */
    Async = 1
}
export declare enum RecordFlags {
    None = 0,
    MaskFromChild = 134217728,
    Private = 268435456,
    MaskHasProxy = 536870912,
    MaskInstantiating = 1073741824
}
/**
 * The default scope identifier.
 *
 * Tokens decorated with `@Injectable()` (no explicit scope) are registered
 * in the `'root'` scope. Root-scoped singletons live for the application lifetime.
 */
export declare const ROOT_SCOPE = "root";
/**
 * A special scope marker that bypasses scope checks.
 *
 * When used as the scope parameter, the injector skips its normal scope-match logic
 * and resolves the token regardless of scope. Used internally for sandbox / minimal resolution.
 */
export declare const IGNORE_SCOPE: unique symbol;
/**
 * @internal
 * Internal flags used by `markInject()` to distinguish between Inject-type
 * and Pipeline-type decorators.
 *
 * Inject-type (e.g. `@Inject`): identifies an injection token.
 * Pipeline-type: identifies parameters that require value transforms (defined by consuming frameworks).
 */
export declare enum DecoratorFlags {
    /** Marks an injection-type decorator (e.g. `@Inject`). */
    Inject = -1,
    /** Marks a pipeline / value-transform decorator (defined by consuming frameworks via `markInject`). */
    Pipeline = -2
}
export declare const NO_VALUE: {};
export declare const EMPTY_ARRAY: readonly any[];
