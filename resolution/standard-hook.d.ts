/**
 * @file university/di/resolution/standard-hook.ts
 * @description Standard implementations for Metadata-Driven Hooks.
 */
import { TokenKey, Provider } from '../metadata';
import { InjectorRecord, Injector } from '../registry';
export declare function onAdmission(token: TokenKey, provider: Provider, context: Injector): boolean | void;
export declare function onScopeCheck(definition: any, scope: any, context: Injector): boolean | void;
export declare function onTransientCheck(token: TokenKey, record: InjectorRecord<any>, context: Injector): boolean | void;
export declare function runCustomFactory(token: TokenKey, record: InjectorRecord<any>, next: () => any, context: Injector): () => any;
export declare function runBefore(token: TokenKey, record: InjectorRecord<any>, context: Injector): void;
export declare function runBeforeAsync(token: TokenKey, record: InjectorRecord<any>, context: Injector): Promise<void>;
export declare function runAfter(token: TokenKey, instance: any, record: InjectorRecord<any>, context: Injector): void;
export declare function runAfterAsync(token: TokenKey, instance: any, record: InjectorRecord<any>, context: Injector): Promise<void>;
export declare function runError(token: TokenKey, error: any, record: InjectorRecord<any>, context: Injector): any;
export declare function onDispose(token: any, instance: any, context: Injector): Promise<void> | void;
