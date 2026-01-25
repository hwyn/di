/**
 * @file impl/static-injector.ts
 * @description Concrete implementation of the Injector class (StaticInjector), managing scope and resolution.
 */
import { Injector, InjectorRecord, InternalInjector } from '../registry';
import { Provider, TokenKey, Type } from '../metadata';
export { InjectFlags } from '../metadata';
export declare function deepProviders(injector: Injector, providers?: Provider[] | null): void;
export declare class StaticInjector implements InternalInjector {
    private scope;
    private isDestroyed;
    private onDestroy;
    private records;
    interceptStrategy: ((instance: any, token: any) => any) | null;
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
