import { __awaiter } from "tslib";
import { dispose, isDisposable } from "./instantiator.js";
import { debugLog as log, InstantiationPolicy, getSecureTokenName } from "../common/index.js";
/**
 * Controls async resolution behavior: timeout enforcement, concurrency locking,
 * and safe rollback of partially resolved multi-dependencies.
 *
 * - **Timeout**: Rejects after `TIMEOUT` ms (default from `InstantiationPolicy.TIMEOUT`).
 * - **Slow warning**: Logs a performance warning if resolution exceeds `SLOW_THRESHOLD` ms.
 * - **Concurrency lock**: Prevents double resolution (race conditions / circular dependencies).
 * - **Rollback**: Disposes all successfully resolved instances if any dependency fails.
 */
export class AsyncGovernance {
    static dispose(instance) {
        var _a, _b;
        if (isDisposable(instance)) {
            try {
                dispose(instance);
            }
            catch (e) {
                (_b = (_a = InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn) === null || _b === void 0 ? void 0 : _b.call(_a, 'Error during rollback disposal: ' + (e instanceof Error ? e.message : e));
                throw e;
            }
        }
    }
    static governLifecycle(record, worker) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            if (record.resolving) {
                return record.resolving;
            }
            const tokenName = getSecureTokenName(((_a = record.factory) === null || _a === void 0 ? void 0 : _a.name) || ((_b = record.factory) === null || _b === void 0 ? void 0 : _b.__type__) || 'AnonymousFactory');
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
                if (duration > AsyncGovernance.SLOW_THRESHOLD && InstantiationPolicy.strictPerformance) {
                    (_d = (_c = InstantiationPolicy.logger) === null || _c === void 0 ? void 0 : _c.warn) === null || _d === void 0 ? void 0 : _d.call(_c, `[Performance Warning] Resolution for '${tokenName}' took ${duration}ms`);
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
    static enforceLock(record, token) {
        if (record.resolving) {
            const name = getSecureTokenName(token);
            const msg = `Circular dependency or Race Condition: Token '${name}' is currently being resolved asynchronously. Use 'getAsync' or await the parent resolution.`;
            throw new Error(msg);
        }
    }
    static enforceSyncConstraint(token) {
        var _a;
        const name = getSecureTokenName(token);
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
                for (let i = 0; i < results.length; i++) {
                    const r = results[i];
                    if (r.status !== 'fulfilled')
                        continue;
                    const shouldDispose = disposeMask ? disposeMask[i] : true;
                    if (shouldDispose)
                        this.dispose(r.value);
                }
                if (rejected.length === 1) {
                    throw rejected[0].reason;
                }
                const reasons = rejected.map(r => r.reason.message || r.reason).join('; ');
                const msg = `Multiple Dependency Failures: ${reasons}`;
                throw new Error(msg);
            }
            return results.map(r => r.value);
        });
    }
}
AsyncGovernance.TIMEOUT = InstantiationPolicy.TIMEOUT;
AsyncGovernance.SLOW_THRESHOLD = 1000;