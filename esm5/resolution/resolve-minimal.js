/**
 * @file impl/resolve-minimal.ts
 * @description Provides a lightweight, standalone resolution mechanism (useful for testing or simple scopes).
 */
import { __awaiter, __generator } from "tslib";
import { INJECTOR, runInInjectionContext } from "../registry/index.js";
import { IGNORE_SCOPE } from "../metadata/index.js";
import { dispose, instantiate, instantiateAsync, isDisposable } from "./instantiator.js";
import { resolveDefinition } from "./strategy.js";
import { onDispose, onTransientCheck } from "./standard-hook.js";
var NOOP = function () { };
function findParentRecord(cursor, t) {
    var _a;
    while (cursor) {
        var r = (_a = cursor.getRecord) === null || _a === void 0 ? void 0 : _a.call(cursor, t);
        if (r && !((r.flags || 0) & 268435456 /* RecordFlags.Private */)) {
            return r;
        }
        cursor = cursor.parent;
    }
    return undefined;
}
export function resolveMinimal(token, parent) {
    var cache = new Map();
    var active = [];
    var sandbox = {
        set: NOOP,
        destroy: NOOP,
        destroyed: false,
        get: function (t) { return resolve(t); },
    };
    function resolve(t) {
        if (t === INJECTOR)
            return sandbox;
        var c = cache.get(t);
        if (c !== undefined)
            return c;
        var r = findParentRecord(parent, t);
        var record = resolveDefinition(t, r, IGNORE_SCOPE, sandbox);
        if (!record)
            return null;
        if (onTransientCheck(t, record, sandbox)) {
            return instantiate(t, record, sandbox);
        }
        var val = instantiate(t, record, sandbox);
        if (record.multi) {
            val.forEach(function (v) { return isDisposable(v) && active.push({ instance: v, token: t }); });
        }
        else {
            isDisposable(val) && active.push({ instance: val, token: t });
        }
        if (val != null)
            cache.set(t, val);
        return val || null;
    }
    return runInInjectionContext(sandbox, function () {
        return [resolve(token), function () {
                var promises = [];
                while (active.length) {
                    var _a = active.pop(), instance = _a.instance, token_1 = _a.token;
                    var ret = onDispose(token_1, instance, sandbox);
                    if (ret instanceof Promise)
                        promises.push(ret);
                    var p = dispose(instance);
                    if (p instanceof Promise)
                        promises.push(p);
                }
                if (promises.length)
                    return Promise.all(promises).then(function () { });
            }];
    });
}
export function resolveMinimalAsync(token, parent) {
    return __awaiter(this, void 0, void 0, function () {
        function resolve(t) {
            return __awaiter(this, void 0, void 0, function () {
                var c, r, record, valPromise, val;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (t === INJECTOR)
                                return [2 /*return*/, sandbox];
                            c = cache.get(t);
                            if (c !== undefined)
                                return [2 /*return*/, c];
                            r = findParentRecord(parent, t);
                            record = resolveDefinition(t, r, IGNORE_SCOPE, sandbox);
                            if (!record)
                                return [2 /*return*/, null];
                            if (onTransientCheck(t, record, sandbox)) {
                                return [2 /*return*/, instantiateAsync(t, record, sandbox)];
                            }
                            valPromise = instantiateAsync(t, record, sandbox);
                            cache.set(t, valPromise);
                            return [4 /*yield*/, valPromise];
                        case 1:
                            val = _a.sent();
                            // Update cache with value if desired, or leave promise. Leaving promise is standard for simple async caches to avoid race conditions.
                            // However, for active tracking we need the instance.
                            if (val && typeof val === 'object' && (isDisposable(val) || record.flags === 268435456 /* RecordFlags.Private */)) {
                                active.push({ instance: val, token: t });
                            }
                            return [2 /*return*/, val];
                    }
                });
            });
        }
        var cache, active, sandbox;
        var _this = this;
        return __generator(this, function (_a) {
            cache = new Map();
            active = [];
            sandbox = {
                set: NOOP,
                destroy: NOOP,
                destroyed: false,
                get: function (t) { return resolve(t); },
                getAsync: function (t) { return resolve(t); },
            };
            return [2 /*return*/, runInInjectionContext(sandbox, function () { return __awaiter(_this, void 0, void 0, function () {
                    var instance;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, resolve(token)];
                            case 1:
                                instance = _a.sent();
                                return [2 /*return*/, [instance, function () { return __awaiter(_this, void 0, void 0, function () {
                                            var promises, item, h, d;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        promises = [];
                                                        while (active.length) {
                                                            item = active.pop();
                                                            cache.delete(item.token);
                                                            h = onDispose(item.token, item.instance, sandbox);
                                                            if (h instanceof Promise)
                                                                promises.push(h);
                                                            d = dispose(item.instance);
                                                            if (d instanceof Promise)
                                                                promises.push(d);
                                                        }
                                                        if (!promises.length) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, Promise.all(promises)];
                                                    case 1:
                                                        _a.sent();
                                                        _a.label = 2;
                                                    case 2: return [2 /*return*/];
                                                }
                                            });
                                        }); }]];
                        }
                    });
                }); })];
        });
    });
}
