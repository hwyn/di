import { InjectorRecord } from '../registry';
import { TokenKey } from '../metadata';
/**
 * Controls async resolution behavior: timeout enforcement, concurrency locking,
 * and safe rollback of partially resolved multi-dependencies.
 *
 * - **Timeout**: Rejects after `TIMEOUT` ms (default from `InstantiationPolicy.TIMEOUT`).
 * - **Slow warning**: Logs a performance warning if resolution exceeds `SLOW_THRESHOLD` ms.
 * - **Concurrency lock**: Prevents double resolution (race conditions / circular dependencies).
 * - **Rollback**: Disposes all successfully resolved instances if any dependency fails.
 */
export declare class AsyncGovernance {
    static TIMEOUT: number;
    static SLOW_THRESHOLD: number;
    static dispose(instance: unknown): void;
    static governLifecycle<T>(record: InjectorRecord<T>, worker: Promise<T>): Promise<T>;
    static enforceLock(record: InjectorRecord<unknown>, token: TokenKey): void;
    static enforceSyncConstraint(token: TokenKey): void;
    static secureMultiResolve(resolutions: unknown[], disposeMask?: boolean[]): Promise<unknown[]>;
}
