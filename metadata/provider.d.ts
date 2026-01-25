/**
 * @file meta/provider.ts
 * @description Defines the types for Dependency Injection Providers.
 */
import { InjectorToken } from './injector-token';
export declare interface Type<T = any> extends Function {
    new (...args: any[]): T;
}
export declare interface TypeClass<T = any> extends Type<T> {
    [x: string]: any;
}
export declare type TokenKey = TypeClass | InjectorToken | Function;
export type Token<T = any> = Type<T> | InjectorToken | Function;
export interface AbstractProvider {
    provide: TokenKey;
    multi?: boolean;
    private?: boolean;
}
export interface AbstractProviderWithDeps extends AbstractProvider {
    deps?: any[];
}
export interface ExistingProvider extends AbstractProvider {
    useExisting: any;
}
export interface ClassProvider extends AbstractProviderWithDeps {
    useClass: Type<any>;
}
export interface ConstructorProvider extends AbstractProviderWithDeps {
    provide: Type<any>;
}
export interface ValueProvider extends AbstractProvider {
    useValue: any;
}
export interface FactoryProvider extends AbstractProviderWithDeps {
    useFactory: (...args: any[]) => any;
}
export declare type Provider = ValueProvider | ExistingProvider | ClassProvider | ConstructorProvider | FactoryProvider | Type | Provider[];
export interface DependencyDef {
    token: any;
    flags: number;
    transforms?: any[];
}
export type ProvidedInScope = string | symbol | object | null | undefined;
export interface InjectableDef<T, S = ProvidedInScope> {
    factory?: (ctx?: any) => T;
    opt?: any;
    providedIn?: S;
    token: any;
}
