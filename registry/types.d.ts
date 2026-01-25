/**
 * @file core/types.ts
 * @description Defines core interfaces and types used within the DI system (Injector records, hooks, context).
 */
import { Provider } from '../metadata';
import { InstanceHookMetadata } from './hook-metadata';
export type EMPTY_Object = {};
import { Injector } from './injector';
export interface Record<T> {
    factory: ((ctx?: Injector, mode?: number) => T) | undefined;
    value: T | object;
    multi: any[] | undefined;
    flags?: number;
}
export interface InjectorRecord<T> extends Record<T> {
    [key: symbol]: any;
    provider?: Provider;
    resolving?: Promise<T>;
    metadata?: InstanceHookMetadata;
}
export interface OnInit {
    onInit(): void | Promise<void>;
}
export interface OnDestroy {
    destroy(): void | Promise<void>;
}
export type InterceptorFn = (instance: any, token: any, injector: any) => any;
/**
 * Interface describing the internal contract of an Injector that supports Interceptors.
 * This avoids unsafe 'as any' casting.
 */
export interface InternalInjector extends Injector {
    interceptStrategy?: ((instance: any, token: any) => any) | null;
}
