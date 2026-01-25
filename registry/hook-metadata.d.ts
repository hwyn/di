/**
 * @file university/di/registry/hook-metadata.ts
 * @description Utilities and metadata definitions for the Metadata-Driven Hook system.
 */
import { InjectableDef } from '../metadata';
import { InjectorRecord } from './types';
import type { Injector } from './injector';
export declare const DI_HOOK_METADATA: unique symbol;
export interface HookOptions<T = any> {
    onScopeCheck?: (def: InjectableDef<any>, scope: string | symbol, context: Injector) => boolean;
    onTransientCheck?: boolean | ((token: any, record: InjectorRecord<any>, context: Injector) => boolean);
    onAllow?: (token: any, provider: any, context: Injector) => boolean;
    customFactory?: (record: InjectorRecord<any>, next: () => T, context: Injector) => T;
    before?: (token: any, record: InjectorRecord<any>, context: Injector) => void;
    after?: (instance: T, token: any, context: Injector) => void;
    onError?: (error: unknown, token: any, context: Injector) => T | void;
    onDispose?: (instance: T, context: Injector) => void | Promise<void>;
    order?: number;
}
export interface InstanceHookMetadata {
    onScopeCheck?: Function;
    onTransientCheck?: boolean | Function;
    onAllow?: Function;
    customFactory?: Function;
    beforeListeners: Array<{
        fn: Function;
        order: number;
    }>;
    afterListeners: Array<{
        fn: Function;
        order: number;
    }>;
    errorHandlers: Array<{
        fn: Function;
        order: number;
    }>;
    disposeListeners: Array<{
        fn: Function;
        order: number;
    }>;
}
export declare class HookMetadata {
    static hook(target: any, options: HookOptions): void;
    static get(target: any): InstanceHookMetadata | undefined;
    private static getWritableStore;
}
