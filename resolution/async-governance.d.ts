/**
 * @file resolution/async-strategy.ts
 * @description Centralized governance for all asynchronous operations in the DI system.
 * Handles Promise promotion, lifecycle governance, lock management, and transaction rollbacks.
 */
import { InjectorRecord } from '../registry';
export declare class AsyncGovernance {
    static TIMEOUT: number;
    static SLOW_THRESHOLD: number;
    static dispose(instance: any): void;
    static governLifecycle<T>(record: InjectorRecord<T>, worker: Promise<T>): Promise<T>;
    static enforceLock(record: InjectorRecord<any>, tokenName: string): void;
    static secureMultiResolve(resolutions: (any | Promise<any>)[]): Promise<any[]>;
}
