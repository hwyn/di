/**
 * @file resolution/async-strategy.ts
 * @description Centralized governance for all asynchronous operations in the DI system.
 * Handles Promise promotion, lifecycle governance, lock management, and transaction rollbacks.
 */
import { __awaiter } from "tslib";
import { dispose, isDisposable } from "./instantiator.js";
import { debugLog as log, InstantiationPolicy } from "../common/index.js";
// Centralized governance for all asynchronous operations in the DI system.
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
            var _a;
            if (record.resolving) {
                return record.resolving;
            }
            const tokenName = ((_a = record.factory) === null || _a === void 0 ? void 0 : _a.name) || 'AnonymousFactory';
            record.resolving = worker;
            log('governLifecycle', `awaiting async resolution: ${tokenName}`);
            worker.catch(() => { });
            let timer;
            const startTime = Date.now();
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    timer = setTimeout(() => {
                        reject(new Error(`Async resolution timeout after ${AsyncGovernance.TIMEOUT}ms for token: ${tokenName}`));
                    }, AsyncGovernance.TIMEOUT);
                });
                const instance = yield Promise.race([worker, timeoutPromise]);
                const duration = Date.now() - startTime;
                if (duration > AsyncGovernance.SLOW_THRESHOLD) {
                    console.warn(`[Performance Warning] Resolution for '${tokenName}' took ${duration}ms`);
                }
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
    static enforceSyncConstraint(token) {
        var _a;
        const name = token.name || token.toString();
        const msg = `[DI] Warning: Synchronous resolution of token '${name}' resulted in an async Promise. Ensure all dependencies are synchronous or use 'getAsync'.`;
        if (InstantiationPolicy.strictAsyncLifecycle) {
            throw new Error(msg.replace('Warning:', 'Error:'));
        }
        (_a = InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(msg);
    }
    static secureMultiResolve(resolutions, disposeMask) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.allSettled(resolutions);
            const rejected = results
                .filter(r => r.status === 'rejected');
            if (rejected.length > 0) {
                // Rollback: Dispose any successful resolutions in this transaction
                results
                    .filter(r => r.status === 'fulfilled')
                    .forEach((s, index) => {
                    // If mask exists, only dispose if true. Default is true (dispose all).
                    const shouldDispose = disposeMask ? disposeMask[index] : true;
                    if (shouldDispose)
                        this.dispose(s.value);
                });
                if (rejected.length === 1) {
                    throw rejected[0].reason;
                }
                // Aggregate multiple failures
                const reasons = rejected.map(r => r.reason.message || r.reason).join('; ');
                throw new Error(`Multiple Dependency Failures: ${reasons}`);
            }
            return results.map(r => r.value);
        });
    }
}
// Default timeout: 10 seconds (Configurable)
AsyncGovernance.TIMEOUT = 10000;
// Performance threshold: 500ms
AsyncGovernance.SLOW_THRESHOLD = 500;