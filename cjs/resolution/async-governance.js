"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncGovernance = void 0;
var tslib_1 = require("tslib");
var instantiator_1 = require("./instantiator");
var common_1 = require("../common");
/**
 * Controls async resolution behavior: timeout enforcement, concurrency locking,
 * and safe rollback of partially resolved multi-dependencies.
 *
 * - **Timeout**: Rejects after `TIMEOUT` ms (default from `InstantiationPolicy.TIMEOUT`).
 * - **Slow warning**: Logs a performance warning if resolution exceeds `SLOW_THRESHOLD` ms.
 * - **Concurrency lock**: Prevents double resolution (race conditions / circular dependencies).
 * - **Rollback**: Disposes all successfully resolved instances if any dependency fails.
 */
var AsyncGovernance = /** @class */ (function () {
    function AsyncGovernance() {
    }
    AsyncGovernance.dispose = function (instance) {
        var _a, _b;
        if ((0, instantiator_1.isDisposable)(instance)) {
            try {
                (0, instantiator_1.dispose)(instance);
            }
            catch (e) {
                (_b = (_a = common_1.InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn) === null || _b === void 0 ? void 0 : _b.call(_a, 'Error during rollback disposal: ' + (e instanceof Error ? e.message : e));
                throw e;
            }
        }
    };
    AsyncGovernance.governLifecycle = function (record, worker) {
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            var tokenName, timer, startTime, timeoutPromise, instance, duration, e_1;
            var _a, _b, _c, _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (record.resolving) {
                            return [2 /*return*/, record.resolving];
                        }
                        tokenName = (0, common_1.getSecureTokenName)(((_a = record.factory) === null || _a === void 0 ? void 0 : _a.name) || ((_b = record.factory) === null || _b === void 0 ? void 0 : _b.__type__) || 'AnonymousFactory');
                        record.resolving = worker;
                        (0, common_1.debugLog)('governLifecycle', "awaiting async resolution: ".concat(tokenName));
                        worker.catch(function () { });
                        startTime = Date.now();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, 4, 5]);
                        timeoutPromise = new Promise(function (_, reject) {
                            timer = setTimeout(function () {
                                reject(new Error("Async resolution timeout after ".concat(AsyncGovernance.TIMEOUT, "ms for token: ").concat(tokenName)));
                            }, AsyncGovernance.TIMEOUT);
                        });
                        return [4 /*yield*/, Promise.race([worker, timeoutPromise])];
                    case 2:
                        instance = _e.sent();
                        duration = Date.now() - startTime;
                        if (duration > AsyncGovernance.SLOW_THRESHOLD && common_1.InstantiationPolicy.strictPerformance) {
                            (_d = (_c = common_1.InstantiationPolicy.logger) === null || _c === void 0 ? void 0 : _c.warn) === null || _d === void 0 ? void 0 : _d.call(_c, "[Performance Warning] Resolution for '".concat(tokenName, "' took ").concat(duration, "ms"));
                        }
                        record.value = instance;
                        return [2 /*return*/, instance];
                    case 3:
                        e_1 = _e.sent();
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
    AsyncGovernance.enforceLock = function (record, token) {
        if (record.resolving) {
            var name = (0, common_1.getSecureTokenName)(token);
            var msg = "Circular dependency or Race Condition: Token '".concat(name, "' is currently being resolved asynchronously. Use 'getAsync' or await the parent resolution.");
            throw new Error(msg);
        }
    };
    AsyncGovernance.enforceSyncConstraint = function (token) {
        var _a;
        var name = (0, common_1.getSecureTokenName)(token);
        var msg = "[DI] Warning: Synchronous resolution of token '".concat(name, "' resulted in an async Promise. Ensure all dependencies are synchronous or use 'getAsync'.");
        if (common_1.InstantiationPolicy.strictAsyncLifecycle) {
            throw new Error(msg.replace('Warning:', 'Error:'));
        }
        (_a = common_1.InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(msg);
    };
    AsyncGovernance.secureMultiResolve = function (resolutions, disposeMask) {
        return tslib_1.__awaiter(this, void 0, Promise, function () {
            var results, rejected, i, r, shouldDispose, reasons, msg;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.allSettled(resolutions)];
                    case 1:
                        results = _a.sent();
                        rejected = results
                            .filter(function (r) { return r.status === 'rejected'; });
                        if (rejected.length > 0) {
                            for (i = 0; i < results.length; i++) {
                                r = results[i];
                                if (r.status !== 'fulfilled')
                                    continue;
                                shouldDispose = disposeMask ? disposeMask[i] : true;
                                if (shouldDispose)
                                    this.dispose(r.value);
                            }
                            if (rejected.length === 1) {
                                throw rejected[0].reason;
                            }
                            reasons = rejected.map(function (r) { return r.reason.message || r.reason; }).join('; ');
                            msg = "Multiple Dependency Failures: ".concat(reasons);
                            throw new Error(msg);
                        }
                        return [2 /*return*/, results.map(function (r) { return r.value; })];
                }
            });
        });
    };
    AsyncGovernance.TIMEOUT = common_1.InstantiationPolicy.TIMEOUT;
    AsyncGovernance.SLOW_THRESHOLD = 1000;
    return AsyncGovernance;
}());
exports.AsyncGovernance = AsyncGovernance;