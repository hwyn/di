"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMinimal = resolveMinimal;
exports.resolveMinimalAsync = resolveMinimalAsync;
var tslib_1 = require("tslib");
var registry_1 = require("../registry");
var metadata_1 = require("../metadata");
var instantiator_1 = require("./instantiator");
var strategy_1 = require("./strategy");
var standard_hook_1 = require("./standard-hook");
var NOOP = function () { };
function findParentRecord(cursor, token) {
    var _a;
    var current = cursor;
    while (current) {
        var r = (_a = current.getRecord) === null || _a === void 0 ? void 0 : _a.call(current, token);
        if (r && !((r.flags || 0) & metadata_1.RecordFlags.Private)) {
            return r;
        }
        current = current.parent;
    }
    return undefined;
}
/**
 * Resolves a token in a lightweight sandbox without creating a full `Injector`.
 *
 * Returns a tuple `[instance, disposeFn]` where `disposeFn` cleans up all
 * instances created during this resolution. Useful for one-off resolutions
 * (e.g. tests, CLI commands) where a full injector lifecycle is not needed.
 *
 * @typeParam T - The expected instance type.
 * @param token - The token to resolve.
 * @param parent - Optional parent injector for fallback lookups.
 * @returns A tuple of `[instance, dispose]`.
 *
 * @example
 * ```ts
 * const [service, dispose] = resolveMinimal(MyService, rootInjector);
 * try {
 *   service.doWork();
 * } finally {
 *   dispose();  // cleanup
 * }
 * ```
 */
function resolveMinimal(token, parent) {
    var cache = new Map();
    var active = [];
    var sandbox = {
        set: NOOP,
        destroy: NOOP,
        destroyed: false,
        get: function (t) { return resolve(t); },
    };
    var injector = sandbox;
    function resolve(t) {
        if (t === registry_1.INJECTOR)
            return injector;
        var c = cache.get(t);
        if (c !== undefined)
            return c;
        var r = findParentRecord(parent, t);
        var record = (0, strategy_1.resolveDefinition)(t, r, metadata_1.IGNORE_SCOPE, injector);
        if (!record)
            return null;
        if ((0, standard_hook_1.onTransientCheck)(t, record, injector)) {
            return (0, instantiator_1.instantiate)(t, record, injector);
        }
        var val = (0, instantiator_1.instantiate)(t, record, injector);
        if (record.multi) {
            val.forEach(function (v) { return (0, instantiator_1.isDisposable)(v) && active.push({ instance: v, token: t }); });
        }
        else {
            (0, instantiator_1.isDisposable)(val) && active.push({ instance: val, token: t });
        }
        if (val != null)
            cache.set(t, val);
        return val !== null && val !== void 0 ? val : null;
    }
    return (0, registry_1.runInInjectionContext)(injector, function () {
        return [resolve(token), function () {
                var promises = [];
                while (active.length) {
                    var _a = active.pop(), instance = _a.instance, tk = _a.token;
                    var ret = (0, standard_hook_1.onDispose)(tk, instance, injector);
                    if (ret instanceof Promise)
                        promises.push(ret);
                    var p = (0, instantiator_1.dispose)(instance);
                    if (p instanceof Promise)
                        promises.push(p);
                }
                if (promises.length)
                    return Promise.all(promises).then(function () { });
            }];
    });
}
/** Async version of resolveMinimal. */
function resolveMinimalAsync(token, parent) {
    return tslib_1.__awaiter(this, void 0, Promise, function () {
        function resolve(t) {
            return tslib_1.__awaiter(this, void 0, Promise, function () {
                var c, r, record, valPromise, val;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (t === registry_1.INJECTOR)
                                return [2 /*return*/, injector];
                            c = cache.get(t);
                            if (c !== undefined)
                                return [2 /*return*/, c];
                            r = findParentRecord(parent, t);
                            record = (0, strategy_1.resolveDefinition)(t, r, metadata_1.IGNORE_SCOPE, injector);
                            if (!record)
                                return [2 /*return*/, null];
                            if ((0, standard_hook_1.onTransientCheck)(t, record, injector)) {
                                return [2 /*return*/, (0, instantiator_1.instantiateAsync)(t, record, injector)];
                            }
                            valPromise = (0, instantiator_1.instantiateAsync)(t, record, injector);
                            cache.set(t, valPromise);
                            return [4 /*yield*/, valPromise];
                        case 1:
                            val = _a.sent();
                            if (val && typeof val === 'object' && ((0, instantiator_1.isDisposable)(val) || record.flags === metadata_1.RecordFlags.Private)) {
                                active.push({ instance: val, token: t });
                            }
                            return [2 /*return*/, val];
                    }
                });
            });
        }
        var cache, active, sandbox, injector;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            cache = new Map();
            active = [];
            sandbox = {
                set: NOOP,
                destroy: NOOP,
                destroyed: false,
                get: function (t) { return resolve(t); },
                getAsync: function (t) { return resolve(t); },
            };
            injector = sandbox;
            return [2 /*return*/, (0, registry_1.runInInjectionContext)(injector, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var instance;
                    var _this = this;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, resolve(token)];
                            case 1:
                                instance = _a.sent();
                                return [2 /*return*/, [instance, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                            var promises, item, h, d;
                                            return tslib_1.__generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        promises = [];
                                                        while (active.length) {
                                                            item = active.pop();
                                                            cache.delete(item.token);
                                                            h = (0, standard_hook_1.onDispose)(item.token, item.instance, injector);
                                                            if (h instanceof Promise)
                                                                promises.push(h);
                                                            d = (0, instantiator_1.dispose)(item.instance);
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