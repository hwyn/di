import { InjectorRecord, Injector, InterceptorFn, RecordFactory } from '../registry';
import { AnnotationMeta, InjectableDef, Provider, ScopeId, TokenKey, Type } from '../metadata';
export declare function resolveDefinition(token: TokenKey, record: InjectorRecord<any> | undefined | null, scope: ScopeId | undefined, ctx: Injector): InjectorRecord<any> | null;
export declare function checkScope(def: InjectableDef<any>, scope: ScopeId | undefined): boolean;
export declare function makeRecord<T>(factory?: (ctx?: Injector) => T, value?: T | object, multi?: boolean, provider?: Provider, isPrivate?: boolean): InjectorRecord<T>;
export declare function resolveMulti(token: TokenKey, providers: Provider[], ctx: Injector): unknown;
export declare function resolveMultiAsync(token: TokenKey, providers: Provider[], ctx: Injector): Promise<unknown[]>;
export declare function convertToFactory(type: TokenKey, provider?: Provider | {
    scope?: ScopeId;
}): RecordFactory;
export declare function createInstance(type: Type, args: unknown[], props?: Record<string, AnnotationMeta[]>): any;
export declare function composeInterceptors(interceptors: InterceptorFn[] | null, parentStrategy: ((i: unknown, t: TokenKey) => unknown) | null, injector: Injector): ((instance: unknown, token: TokenKey) => unknown) | null;
