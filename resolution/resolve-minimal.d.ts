import { Injector } from '../registry';
import { TokenKey, Type } from '../metadata';
/**
 * Resolves a token in a lightweight sandbox without creating a full `Injector`.
 *
 * Returns a tuple `[instance, disposeFn]` where `disposeFn` cleans up all
 * instances created during this resolution. Useful for one-off resolutions
 * (e.g. tests, CLI commands) where a full injector lifecycle is not needed.
 *
 * @typeParam T - The expected instance type.
 * @param token - The token to resolve.
 * @param parent - Optional parent injector for fallback lookups.
 * @returns A tuple of `[instance, dispose]`.
 *
 * @example
 * ```ts
 * const [service, dispose] = resolveMinimal(MyService, rootInjector);
 * try {
 *   service.doWork();
 * } finally {
 *   dispose();  // cleanup
 * }
 * ```
 */
export declare function resolveMinimal<T>(token: Type<T> | TokenKey, parent?: Injector): [T, () => void | Promise<void>];
/** Async version of resolveMinimal. */
export declare function resolveMinimalAsync<T>(token: Type<T> | TokenKey, parent?: Injector): Promise<[T, () => Promise<void>]>;
