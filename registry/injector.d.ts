/**
 * @file core/injector.ts
 * @description Defines the abstract Injector class, which is the primary public API for dependency injection.
 */
import { Provider, TokenKey, Type } from '../metadata';
export declare abstract class Injector {
    readonly destroyed: boolean;
    abstract get<T = any>(token: TokenKey, flags?: number): T;
    abstract get<T = any>(token: any, flags?: number): T;
    abstract getAsync<T = any>(token: TokenKey | Type<T>, flags?: number): Promise<T>;
    abstract set(token: any, provider: Provider): void;
    abstract destroy(): void;
    static __prov_def__: {
        token: typeof Injector;
        factory: () => any;
    };
    static create: (providers?: Provider[] | null, parent?: Injector) => Injector;
}
