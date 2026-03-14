import { Injector } from './injector';
import { TokenKey, ForwardRefFn } from '../metadata';
/**
 * Returns the currently active injector from the injection context, or `null` if none.
 *
 * In Node.js, this reads from `AsyncLocalStorage`. In the browser, from the global store.
 * Typically used inside `runInInjectionContext()` callbacks.
 */
export declare function getInjector(): Injector | null;
/**
 * Executes a function within the injection context of a specific injector.
 *
 * Inside `fn`, calls to `ɵɵInject()` and `getInjector()` return tokens resolved
 * from the provided injector. In Node.js, context isolation uses `AsyncLocalStorage`,
 * ensuring safety across async boundaries. In the browser, a global store is used
 * (async safety requires Zone.js or explicit injector passing).
 *
 * @typeParam T - The return type of the callback.
 * @param injector - The injector to activate as the current context.
 * @param fn - The function to execute within the injection context.
 * @returns The return value of `fn`.
 *
 * @example
 * ```ts
 * const value = runInInjectionContext(injector, () => {
 *   return ɵɵInject(MyService);  // resolves from `injector`
 * });
 * ```
 */
export declare function runInInjectionContext<T>(injector: Injector, fn: () => T): T;
/**
 * @internal
 * Synchronously resolves a token from the current injection context.
 * Used by generated code and internal framework machinery.
 *
 * @param token - The injection token or a `ForwardRefFn`.
 * @param flags - Optional {@link InjectFlags}.
 */
export declare function ɵɵInject(token: TokenKey | ForwardRefFn, flags?: number): unknown;
/**
 * @internal
 * Asynchronously resolves a token from the current injection context.
 * Used by generated code and internal framework machinery.
 *
 * @param token - The injection token or a `ForwardRefFn`.
 * @param flags - Optional {@link InjectFlags}.
 * @returns A Promise resolving to the instance.
 */
export declare function ɵɵInjectAsync(token: TokenKey | ForwardRefFn, flags?: number): Promise<any>;
