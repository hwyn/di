import { Injector, InjectorRecord, InternalInjector } from '../registry';
import { Provider, TokenKey, Type } from '../metadata';
export { InjectFlags } from '../metadata';
/**
 * Batch-registers a potentially nested array of providers into an `Injector`.
 *
 * Flattens arbitrarily nested `Provider[]` and calls `injector.set()` for each
 * entry. For providers with an explicit `provide` key ({@link AbstractProvider}),
 * that key is used as the token; otherwise the provider itself is used as the token
 * (i.e. a class reference acting as both token and implementation).
 *
 * @param injector - The target `Injector` instance to register providers into.
 * @param providers - A provider array (may be nested or `null`/`undefined`).
 *
 * @example
 * ```ts
 * const injector = Injector.create([]);
 * deepProviders(injector, [
 *   Logger,
 *   { provide: CONFIG_TOKEN, useValue: { debug: true } },
 *   [CacheService, [NestedProvider]],
 * ]);
 * ```
 */
export declare function deepProviders(injector: Injector, providers?: Provider[] | null): void;
export declare class StaticInjector implements InternalInjector {
    private scope;
    private isDestroyed;
    private onDestroy;
    private records;
    interceptStrategy: ((instance: unknown, token: TokenKey) => unknown) | null;
    parent?: Injector;
    get destroyed(): boolean;
    constructor(additionalProviders?: Provider[] | null, parent?: Injector);
    get<T>(token: Type<T> | TokenKey, flags?: number): T;
    getAsync<T>(token: Type<T> | TokenKey, flags?: number, resolutionStack?: Set<TokenKey>): Promise<T>;
    set(token: TokenKey, provider: Provider): void | null;
    private resolveBoundaryOrCache;
    destroy(): void | Promise<void>;
    private cleanup;
    getRecord(token: TokenKey): InjectorRecord<any>;
    private tryParent;
    private tryParentAsync;
    private tryResolve;
    private tryResolveAsync;
    private resolveRecord;
    private hydrateSync;
    private hydrateAsync;
    private finishHydrate;
    private registerDispose;
}
