/**
 * @file resolution/async-strategy.ts
 * @description Centralized governance for all asynchronous operations in the DI system.
 * Handles Promise promotion, lifecycle governance, lock management, and transaction rollbacks.
 */
import { __awaiter } from "tslib";
import { dispose, isDisposable } from "./instantiator.js";
// Default timeout for async resolution to prevent deadlocks (10 seconds)
const ASYNC_TIMEOUT_MS = 10000;
export class AsyncGovernance {
    static dispose(instance) {
        if (isDisposable(instance)) {
            try {
                dispose(instance);
            }
            catch (e) {
                console.warn('Error during rollback disposal:', e);
            }
        }
    }
    static governLifecycle(record, worker) {
        return __awaiter(this, void 0, void 0, function* () {
            if (record.resolving) {
                return record.resolving;
            }
            record.resolving = worker;
            worker.catch(() => { });
            let timer;
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    timer = setTimeout(() => {
                        reject(new Error(`Async resolution timeout after ${ASYNC_TIMEOUT_MS}ms for token: ${record.factory}`));
                    }, ASYNC_TIMEOUT_MS);
                });
                const instance = yield Promise.race([worker, timeoutPromise]);
                record.value = instance;
                return instance;
            }
            catch (e) {
                throw e;
            }
            finally {
                clearTimeout(timer);
                record.resolving = undefined;
            }
        });
    }
    static enforceLock(record, tokenName) {
        if (record.resolving) {
            throw new Error(`Circular dependency or Race Condition: Token '${tokenName}' is currently being resolved asynchronously. Use 'getAsync' or await the parent resolution.`);
        }
    }
    static secureMultiResolve(resolutions) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.allSettled(resolutions);
            const rejected = results.find(r => r.status === 'rejected');
            if (rejected) {
                const successful = results
                    .filter(r => r.status === 'fulfilled');
                successful.forEach(s => this.dispose(s.value));
                throw rejected.reason;
            }
            return results.map(r => r.value);
        });
    }
}
