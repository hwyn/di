"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDisposable = isDisposable;
exports.dispose = dispose;
exports.instantiate = instantiate;
exports.executeInstantiation = executeInstantiation;
exports.instantiateAsync = instantiateAsync;
exports.executeInstantiationAsync = executeInstantiationAsync;
var tslib_1 = require("tslib");
var registry_1 = require("../registry");
var metadata_1 = require("../metadata");
var common_1 = require("../common");
var standard_hook_1 = require("./standard-hook");
var cyclic_1 = require("./cyclic");
function getTokenName(token) {
    return (0, common_1.getSecureTokenName)(token);
}
function resolveMetadata(token, record) {
    if (record.metadata)
        return record.metadata;
    var metadata = registry_1.HookMetadata.get(token);
    if (metadata) {
        record.metadata = metadata;
    }
    return metadata;
}
function hasOnInit(instance) {
    return !!instance && typeof instance.onInit === 'function';
}
function reportAsyncLeak(token) {
    var _a;
    var name = getTokenName(token);
    var msg = "[DI] Warning: Service '".concat(name, "' has an async onInit(), but was instantiated synchronously. The initialization may not complete before usage.");
    if (common_1.InstantiationPolicy.strictAsyncLifecycle) {
        throw new Error(msg.replace('Warning:', 'Error:'));
    }
    (_a = common_1.InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(msg);
}
function isDisposable(instance) {
    return !!instance && typeof instance.destroy === 'function';
}
function dispose(instance) {
    if (isDisposable(instance)) {
        return instance.destroy();
    }
}
function instantiate(token, record, ctx) {
    var next = function () { return executeInstantiation(token, record, ctx); };
    var instance = (0, cyclic_1.guardCyclicDependency)(token, record, next);
    return applyInterceptorSync(instance, token, ctx);
}
function executeInstantiation(token, record, ctx) {
    var _a, _b, _c;
    if (common_1.DEBUG_MODE.enabled) {
        (0, common_1.debugLog)('instantiate', getTokenName(token));
    }
    var metadata = resolveMetadata(token, record);
    if (!metadata) {
        var instance_1 = record.factory(ctx, metadata_1.ResolveMode.Sync);
        if (hasOnInit(instance_1)) {
            var result = instance_1.onInit();
            if (result instanceof Promise)
                reportAsyncLeak(token);
        }
        return instance_1;
    }
    if ((_a = metadata.beforeListeners) === null || _a === void 0 ? void 0 : _a.length) {
        (0, standard_hook_1.runBefore)(token, record, ctx);
    }
    var instance;
    var baseFactory = function () { return record.factory(ctx, metadata_1.ResolveMode.Sync); };
    var effectiveFactory = metadata.customFactory
        ? function () { return metadata.customFactory(record, baseFactory, ctx); }
        : baseFactory;
    if ((_b = metadata.errorHandlers) === null || _b === void 0 ? void 0 : _b.length) {
        try {
            instance = effectiveFactory();
        }
        catch (e) {
            instance = (0, standard_hook_1.runError)(token, e, record, ctx);
        }
    }
    else {
        instance = effectiveFactory();
    }
    if ((_c = metadata.afterListeners) === null || _c === void 0 ? void 0 : _c.length) {
        (0, standard_hook_1.runAfter)(token, instance, record, ctx);
    }
    if (hasOnInit(instance)) {
        var result = instance.onInit();
        if (result instanceof Promise) {
            reportAsyncLeak(token);
        }
    }
    return instance;
}
function applyInterceptorSync(instance, token, ctx) {
    var strategy = ctx.interceptStrategy;
    if (!strategy)
        return instance;
    var result = strategy(instance, token);
    if (result && typeof result.then === 'function') {
        var msg = "[DI] Error: Interceptor for '".concat(getTokenName(token), "' returned a Promise in a synchronous resolution context. This is not allowed.");
        throw new Error(msg);
    }
    return result !== undefined ? result : instance;
}
function instantiateAsync(token, record, ctx) {
    return tslib_1.__awaiter(this, void 0, Promise, function () {
        var instance;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, executeInstantiationAsync(token, record, ctx)];
                case 1:
                    instance = _a.sent();
                    return [2 /*return*/, applyInterceptorAsync(instance, token, ctx)];
            }
        });
    });
}
function executeInstantiationAsync(token, record, ctx) {
    return tslib_1.__awaiter(this, void 0, Promise, function () {
        var metadata, instance_2, result, instance, baseFactory, effectiveFactory, e_1, result, e_2;
        var _this = this;
        var _a, _b, _c, _d, _e;
        return tslib_1.__generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    metadata = resolveMetadata(token, record);
                    if (!!metadata) return [3 /*break*/, 4];
                    return [4 /*yield*/, record.factory(ctx, metadata_1.ResolveMode.Async)];
                case 1:
                    instance_2 = _f.sent();
                    if (!hasOnInit(instance_2)) return [3 /*break*/, 3];
                    result = instance_2.onInit();
                    if (!(result instanceof Promise)) return [3 /*break*/, 3];
                    return [4 /*yield*/, result];
                case 2:
                    _f.sent();
                    _f.label = 3;
                case 3: return [2 /*return*/, instance_2];
                case 4:
                    if (!((_a = metadata.beforeListeners) === null || _a === void 0 ? void 0 : _a.length)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, standard_hook_1.runBeforeAsync)(token, record, ctx)];
                case 5:
                    _f.sent();
                    _f.label = 6;
                case 6:
                    baseFactory = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                        return [2 /*return*/, record.factory(ctx, metadata_1.ResolveMode.Async)];
                    }); }); };
                    effectiveFactory = metadata.customFactory
                        ? function () { return metadata.customFactory(record, baseFactory, ctx); }
                        : baseFactory;
                    if (!((_b = metadata.errorHandlers) === null || _b === void 0 ? void 0 : _b.length)) return [3 /*break*/, 11];
                    _f.label = 7;
                case 7:
                    _f.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, effectiveFactory()];
                case 8:
                    instance = _f.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_1 = _f.sent();
                    instance = (0, standard_hook_1.runError)(token, e_1, record, ctx);
                    return [3 /*break*/, 10];
                case 10: return [3 /*break*/, 13];
                case 11: return [4 /*yield*/, effectiveFactory()];
                case 12:
                    instance = _f.sent();
                    _f.label = 13;
                case 13:
                    _f.trys.push([13, 18, , 19]);
                    if (!((_c = metadata.afterListeners) === null || _c === void 0 ? void 0 : _c.length)) return [3 /*break*/, 15];
                    return [4 /*yield*/, (0, standard_hook_1.runAfterAsync)(token, instance, record, ctx)];
                case 14:
                    _f.sent();
                    _f.label = 15;
                case 15:
                    if (!hasOnInit(instance)) return [3 /*break*/, 17];
                    result = instance.onInit();
                    if (!(result instanceof Promise)) return [3 /*break*/, 17];
                    return [4 /*yield*/, result];
                case 16:
                    _f.sent();
                    _f.label = 17;
                case 17: return [3 /*break*/, 19];
                case 18:
                    e_2 = _f.sent();
                    if (instance && isDisposable(instance)) {
                        try {
                            dispose(instance);
                        }
                        catch (disposeErr) {
                            (_e = (_d = common_1.InstantiationPolicy.logger) === null || _d === void 0 ? void 0 : _d.warn) === null || _e === void 0 ? void 0 : _e.call(_d, '[DI] Rollback disposal failed: ' + (disposeErr instanceof Error ? disposeErr.message : disposeErr));
                        }
                    }
                    throw e_2;
                case 19: return [2 /*return*/, instance];
            }
        });
    });
}
function applyInterceptorAsync(instance, token, ctx) {
    return tslib_1.__awaiter(this, void 0, Promise, function () {
        var strategy, result, awaited;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    strategy = ctx.interceptStrategy;
                    if (!strategy)
                        return [2 /*return*/, instance];
                    result = strategy(instance, token);
                    if (!(result && typeof result.then === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, result];
                case 1:
                    awaited = _a.sent();
                    return [2 /*return*/, awaited !== undefined ? awaited : instance];
                case 2: return [2 /*return*/, result !== undefined ? result : instance];
            }
        });
    });
}