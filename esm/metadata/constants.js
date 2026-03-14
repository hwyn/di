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
export var InjectFlags;
(function (InjectFlags) {
    /** No special behavior — walks the full parent chain. */
    InjectFlags[InjectFlags["Default"] = 0] = "Default";
    /** Returns `null` instead of throwing when the token is not found. */
    InjectFlags[InjectFlags["Optional"] = 1] = "Optional";
    /** Restricts lookup to the current injector only (no parent delegation). */
    InjectFlags[InjectFlags["Self"] = 2] = "Self";
    /** Skips the current injector and resolves from the parent chain. */
    InjectFlags[InjectFlags["SkipSelf"] = 4] = "SkipSelf";
    /** @internal Allows the resolver to return a Promise. */
    InjectFlags[InjectFlags["AllowAsync"] = 65536] = "AllowAsync";
})(InjectFlags || (InjectFlags = {}));
/**
 * Determines whether a resolution runs synchronously or asynchronously.
 *
 * Used internally by the injector and exposed in `TransformContext`
 * so value transforms know the current resolution mode.
 */
export var ResolveMode;
(function (ResolveMode) {
    /** Synchronous resolution via `injector.get()`. */
    ResolveMode[ResolveMode["Sync"] = 0] = "Sync";
    /** Asynchronous resolution via `injector.getAsync()`. */
    ResolveMode[ResolveMode["Async"] = 1] = "Async";
})(ResolveMode || (ResolveMode = {}));
export var RecordFlags;
(function (RecordFlags) {
    RecordFlags[RecordFlags["None"] = 0] = "None";
    RecordFlags[RecordFlags["MaskFromChild"] = 134217728] = "MaskFromChild";
    RecordFlags[RecordFlags["Private"] = 268435456] = "Private";
    RecordFlags[RecordFlags["MaskHasProxy"] = 536870912] = "MaskHasProxy";
    RecordFlags[RecordFlags["MaskInstantiating"] = 1073741824] = "MaskInstantiating";
})(RecordFlags || (RecordFlags = {}));
/**
 * The default scope identifier.
 *
 * Tokens decorated with `@Injectable()` (no explicit scope) are registered
 * in the `'root'` scope. Root-scoped singletons live for the application lifetime.
 */
export const ROOT_SCOPE = 'root';
/**
 * A special scope marker that bypasses scope checks.
 *
 * When used as the scope parameter, the injector skips its normal scope-match logic
 * and resolves the token regardless of scope. Used internally for sandbox / minimal resolution.
 */
export const IGNORE_SCOPE = Symbol('IGNORE_SCOPE');
/**
 * @internal
 * Internal flags used by `markInject()` to distinguish between Inject-type
 * and Pipeline-type decorators.
 *
 * Inject-type (e.g. `@Inject`): identifies an injection token.
 * Pipeline-type: identifies parameters that require value transforms (defined by consuming frameworks).
 */
export var DecoratorFlags;
(function (DecoratorFlags) {
    /** Marks an injection-type decorator (e.g. `@Inject`). */
    DecoratorFlags[DecoratorFlags["Inject"] = -1] = "Inject";
    /** Marks a pipeline / value-transform decorator (defined by consuming frameworks via `markInject`). */
    DecoratorFlags[DecoratorFlags["Pipeline"] = -2] = "Pipeline";
})(DecoratorFlags || (DecoratorFlags = {}));
export const NO_VALUE = {};
export const EMPTY_ARRAY = Object.freeze([]);