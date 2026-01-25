/**
 * @file resolution/async-strategy.ts
 * @description Centralized governance for all asynchronous operations in the DI system.
 * Handles Promise promotion, lifecycle governance, lock management, and transaction rollbacks.
 */
import { __awaiter, __generator } from "tslib";
import { dispose, isDisposable } from "./instantiator.js";
// Default timeout for async resolution to prevent deadlocks (10 seconds)
var ASYNC_TIMEOUT_MS = 10000;
var AsyncGovernance = /** @class */ (function () {
    function AsyncGovernance() {
    }
    AsyncGovernance.dispose = function (instance) {
        if (isDisposable(instance)) {
            try {
                dispose(instance);
            }
            catch (e) {
                console.warn('Error during rollback disposal:', e);
            }
        }
    };
    AsyncGovernance.governLifecycle = function (record, worker) {
        return __awaiter(this, void 0, void 0, function () {
            var timer, timeoutPromise, instance, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (record.resolving) {
                            return [2 /*return*/, record.resolving];
                        }
                        record.resolving = worker;
                        worker.catch(function () { });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        timeoutPromise = new Promise(function (_, reject) {
                            timer = setTimeout(function () {
                                reject(new Error("Async resolution timeout after ".concat(ASYNC_TIMEOUT_MS, "ms for token: ").concat(record.factory)));
                            }, ASYNC_TIMEOUT_MS);
                        });
                        return [4 /*yield*/, Promise.race([worker, timeoutPromise])];
                    case 2:
                        instance = _a.sent();
                        record.value = instance;
                        return [2 /*return*/, instance];
                    case 3:
                        e_1 = _a.sent();
                        throw e_1;
                    case 4:
                        clearTimeout(timer);
                        record.resolving = undefined;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AsyncGovernance.enforceLock = function (record, tokenName) {
        if (record.resolving) {
            throw new Error("Circular dependency or Race Condition: Token '".concat(tokenName, "' is currently being resolved asynchronously. Use 'getAsync' or await the parent resolution."));
        }
    };
    AsyncGovernance.secureMultiResolve = function (resolutions) {
        return __awaiter(this, void 0, void 0, function () {
            var results, rejected, successful;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.allSettled(resolutions)];
                    case 1:
                        results = _a.sent();
                        rejected = results.find(function (r) { return r.status === 'rejected'; });
                        if (rejected) {
                            successful = results
                                .filter(function (r) { return r.status === 'fulfilled'; });
                            successful.forEach(function (s) { return _this.dispose(s.value); });
                            throw rejected.reason;
                        }
                        return [2 /*return*/, results.map(function (r) { return r.value; })];
                }
            });
        });
    };
    return AsyncGovernance;
}());
export { AsyncGovernance };
