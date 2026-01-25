/**
 * @file core/token-registry.ts
 * @description A strongly-typed, scope-isolated registry for collecting global types/tokens with lazy merging and defensive caching.
 */
import { InjectorToken } from '../metadata';
export interface ScopeOptions {
    multi?: boolean;
    allowOverride?: boolean;
}
export type RegistryScope<T> = InjectorToken & {
    readonly _typeGuard?: T;
    readonly options: ScopeOptions;
};
export type RegistryInput<T> = T | RegistryInput<T>[];
export declare class TokenRegistry {
    static createScope<T>(desc: string, options?: ScopeOptions): RegistryScope<T>;
    static register<T>(scope: RegistryScope<T>, items: RegistryInput<T>): void;
    static getOne<T>(scope: RegistryScope<T>): T | undefined;
    static getAll<T>(scope: RegistryScope<T>): ReadonlyArray<T>;
    static deleteScope(scope: RegistryScope<any>): void;
    defineScope(scope: RegistryScope<any>): void;
    private _scopes;
    private _chunks;
    private _cache;
    register<T>(scope: RegistryScope<T>, items: RegistryInput<T>): void;
    getOne<T>(scope: RegistryScope<T>): T | undefined;
    getAll<T>(scope: RegistryScope<T>): ReadonlyArray<T>;
    deleteScope(scope: RegistryScope<any>): void;
    clear(scope: RegistryScope<any>): void;
    _debug(): {
        scope: string;
        writeOps: number;
        hasCache: boolean;
    }[];
}
