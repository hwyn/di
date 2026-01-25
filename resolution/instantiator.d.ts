/**
 * @file impl/lifecycle.ts
 * @description Helper functions for object instantiation and disposal (lifecycle management).
 */
import { InjectorRecord, Injector, OnDestroy } from '../registry';
import { TokenKey, Type } from '../metadata';
export declare function isDisposable(instance: any): instance is OnDestroy;
export declare function dispose(instance: any): void | Promise<void>;
export declare function instantiate<T>(token: Type<T> | TokenKey, record: InjectorRecord<T>, ctx: Injector): T;
export declare function executeInstantiation<T>(token: Type<T> | TokenKey, record: InjectorRecord<T>, ctx: Injector): T;
export declare function instantiateAsync<T>(token: Type<T> | TokenKey, record: InjectorRecord<T>, ctx: Injector): Promise<T>;
export declare function executeInstantiationAsync<T>(token: Type<T> | TokenKey, record: InjectorRecord<T>, ctx: Injector): Promise<T>;
