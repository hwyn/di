/**
 * @file resolution/async-strategy.ts
 * @description Centralized governance for all asynchronous operations in the DI system.
 * Handles Promise promotion, lifecycle governance, lock management, and transaction rollbacks.
 */
import { __awaiter, __generator } from "tslib";
import { dispose, isDisposable } from "./instantiator.js";
import { debugLog as log } from "../common/index.js";
// Centralized governance for all asynchronous operations in the DI system.
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
            var tokenName, timer, startTime, timeoutPromise, instance, duration, e_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (record.resolving) {
                            return [2 /*return*/, record.resolving];
                        }
                        tokenName = ((_a = record.factory) === null || _a === void 0 ? void 0 : _a.name) || 'AnonymousFactory';
                        record.resolving = worker;
                        log('governLifecycle', "awaiting async resolution: ".concat(tokenName));
                        worker.catch(function () { });
                        startTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        timeoutPromise = new Promise(function (_, reject) {
                            timer = setTimeout(function () {
                                reject(new Error("Async resolution timeout after ".concat(AsyncGovernance.TIMEOUT, "ms for token: ").concat(tokenName)));
                            }, AsyncGovernance.TIMEOUT);
                        });
                        return [4 /*yield*/, Promise.race([worker, timeoutPromise])];
                    case 2:
                        instance = _b.sent();
                        duration = Date.now() - startTime;
                        if (duration > AsyncGovernance.SLOW_THRESHOLD) {
                            console.warn("[Performance Warning] Resolution for '".concat(tokenName, "' took ").concat(duration, "ms"));
                        }
                        record.value = instance;
                        return [2 /*return*/, instance];
                    case 3:
                        e_1 = _b.sent();
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
            var results, rejected, reasons;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.allSettled(resolutions)];
                    case 1:
                        results = _a.sent();
                        rejected = results
                            .filter(function (r) { return r.status === 'rejected'; });
                        if (rejected.length > 0) {
                            // Rollback: Dispose any successful resolutions in this transaction
                            results
                                .filter(function (r) { return r.status === 'fulfilled'; })
                                .forEach(function (s) { return _this.dispose(s.value); });
                            if (rejected.length === 1) {
                                throw rejected[0].reason;
                            }
                            reasons = rejected.map(function (r) { return r.reason.message || r.reason; }).join('; ');
                            throw new Error("Multiple Dependency Failures: ".concat(reasons));
                        }
                        return [2 /*return*/, results.map(function (r) { return r.value; })];
                }
            });
        });
    };
    // Default timeout: 10 seconds (Configurable)
    AsyncGovernance.TIMEOUT = 10000;
    // Performance threshold: 500ms
    AsyncGovernance.SLOW_THRESHOLD = 500;
    return AsyncGovernance;
}());
export { AsyncGovernance };
