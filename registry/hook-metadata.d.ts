import { InjectableDef, TokenKey, Provider, ScopeId } from '../metadata';
import { InjectorRecord } from './types';
import type { Injector } from './injector';
export declare const DI_HOOK_METADATA: unique symbol;
/**
 * Lifecycle hook configuration registered per token via `HookMetadata.hook(token, options)`.
 *
 * Hooks allow fine-grained control over a token's resolution lifecycle:
 * scope validation, admission checks, factory customization, pre/post-instantiation
 * callbacks, error handling, and disposal.
 *
 * @typeParam T - The type of the instance managed by this token.
 *
 * @example
 * ```ts
 * HookMetadata.hook(MyService, {
 *   before: (token, record, ctx) => console.log(`Resolving ${token}`),
 *   after: (instance, token, ctx) => console.log(`Created ${token}`),
 *   onDispose: (instance) => instance.cleanup(),
 *   order: 10,
 * });
 * ```
 */
export interface HookOptions<T = any> {
    /** Validates whether the token can be resolved in the given scope. Return `false` to reject. */
    onScopeCheck?: (def: InjectableDef<any>, scope: ScopeId, context: Injector) => boolean;
    /** If `true`, marks the token as transient (no caching). Or a function for conditional transient logic. */
    onTransientCheck?: boolean | ((token: TokenKey, record: InjectorRecord<unknown>, context: Injector) => boolean);
    /** Admission gate: return `false` to block registration of a provider for this token. */
    onAllow?: (token: TokenKey, provider: Provider, context: Injector) => boolean;
    /** Replaces the default factory. `next()` invokes the original factory for delegation. */
    customFactory?: (record: InjectorRecord<unknown>, next: () => T, context: Injector) => T;
    /** Called before the factory runs. Useful for logging or validation. */
    before?: (token: TokenKey, record: InjectorRecord<unknown>, context: Injector) => void;
    /** Called after the instance is created. Useful for logging, metrics, or post-processing. */
    after?: (instance: T, token: TokenKey, context: Injector) => void;
    /** Called when instantiation throws. Return a fallback value or re-throw. */
    onError?: (error: unknown, token: TokenKey, context: Injector) => T | void;
    /** Called when the injector is destroyed. Clean up resources held by the instance. */
    onDispose?: (instance: T, context: Injector) => void | Promise<void>;
    /** Execution order for multi-hook scenarios (lower runs first). Default: `0`. */
    order?: number;
}
export interface InstanceHookMetadata {
    onScopeCheck?: (def: InjectableDef<any>, scope: ScopeId, context: Injector) => boolean;
    onTransientCheck?: boolean | ((token: TokenKey, record: InjectorRecord<unknown>, context: Injector) => boolean);
    onAllow?: (token: TokenKey, provider: Provider, context: Injector) => boolean;
    customFactory?: (record: InjectorRecord<unknown>, next: () => any, context: Injector) => any;
    beforeListeners: Array<{
        fn: (token: TokenKey, record: InjectorRecord<unknown>, context: Injector) => void;
        order: number;
    }>;
    afterListeners: Array<{
        fn: (instance: any, token: TokenKey, context: Injector) => void;
        order: number;
    }>;
    errorHandlers: Array<{
        fn: (error: unknown, token: TokenKey, context: Injector) => any;
        order: number;
    }>;
    disposeListeners: Array<{
        fn: (instance: any, context: Injector) => void | Promise<void>;
        order: number;
    }>;
}
/**
 * Registry for token-level lifecycle hooks.
 *
 * `HookMetadata` attaches lifecycle callbacks to injection tokens. These hooks
 * run at specific points during resolution (scope check, factory override,
 * before/after instantiation, error handling, disposal).
 *
 * Each token can have at most one `onScopeCheck`, `onTransientCheck`, `onAllow`,
 * and `customFactory`. Multiple `before`, `after`, `onError`, and `onDispose`
 * listeners are supported and sorted by `order`.
 *
 * @example
 * ```ts
 * HookMetadata.hook(CacheService, {
 *   customFactory: (record, next, ctx) => {
 *     const cache = next();
 *     cache.setCapacity(100);
 *     return cache;
 *   },
 *   onDispose: (cache) => cache.clear(),
 * });
 * ```
 */
export declare class HookMetadata {
    static hook(target: TokenKey, options: HookOptions): void;
    static get(target: TokenKey): InstanceHookMetadata | undefined;
    private static getWritableStore;
}
