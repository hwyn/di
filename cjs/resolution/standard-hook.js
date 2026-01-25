"use strict";
/**
 * @file university/di/resolution/standard-hook.ts
 * @description Standard implementations for Metadata-Driven Hooks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAdmission = onAdmission;
exports.onScopeCheck = onScopeCheck;
exports.onTransientCheck = onTransientCheck;
exports.runCustomFactory = runCustomFactory;
exports.runBefore = runBefore;
exports.runBeforeAsync = runBeforeAsync;
exports.runAfter = runAfter;
exports.runAfterAsync = runAfterAsync;
exports.runError = runError;
exports.onDispose = onDispose;
var tslib_1 = require("tslib");
var registry_1 = require("../registry");
function onAdmission(token, provider, context) {
    var _a;
    var hook = (_a = registry_1.HookMetadata.get(token)) === null || _a === void 0 ? void 0 : _a.onAllow;
    if (hook) {
        return hook(token, provider, context);
    }
}
function onScopeCheck(definition, scope, context) {
    var _a;
    var hook = (_a = registry_1.HookMetadata.get(definition.token)) === null || _a === void 0 ? void 0 : _a.onScopeCheck;
    if (hook) {
        return hook(definition, scope, context);
    }
}
function onTransientCheck(token, record, context) {
    var _a, _b, _c;
    var strategy = (_b = (_a = record.metadata) === null || _a === void 0 ? void 0 : _a.onTransientCheck) !== null && _b !== void 0 ? _b : (_c = registry_1.HookMetadata.get(token)) === null || _c === void 0 ? void 0 : _c.onTransientCheck;
    if (strategy !== undefined) {
        return typeof strategy === 'function' ? strategy(token, record, context) : strategy;
    }
}
function runCustomFactory(token, record, next, context) {
    var metadata = record.metadata || registry_1.HookMetadata.get(token);
    return (metadata === null || metadata === void 0 ? void 0 : metadata.customFactory) ? function () { return metadata.customFactory(record, next, context); } : next;
}
function runBefore(token, record, context) {
    var e_1, _a;
    var metadata = record.metadata || registry_1.HookMetadata.get(token);
    if (metadata === null || metadata === void 0 ? void 0 : metadata.beforeListeners) {
        try {
            for (var _b = tslib_1.__values(metadata.beforeListeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var listener = _c.value;
                listener.fn(token, record, context);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
}
function runBeforeAsync(token, record, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var metadata, _a, _b, listener, e_2_1;
        var e_2, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    metadata = record.metadata || registry_1.HookMetadata.get(token);
                    if (!(metadata === null || metadata === void 0 ? void 0 : metadata.beforeListeners)) return [3 /*break*/, 8];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 6, 7, 8]);
                    _a = tslib_1.__values(metadata.beforeListeners), _b = _a.next();
                    _d.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 5];
                    listener = _b.value;
                    return [4 /*yield*/, listener.fn(token, record, context)];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_2_1 = _d.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function runAfter(token, instance, record, context) {
    var e_3, _a;
    var metadata = record.metadata || registry_1.HookMetadata.get(token);
    if (metadata === null || metadata === void 0 ? void 0 : metadata.afterListeners) {
        try {
            for (var _b = tslib_1.__values(metadata.afterListeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var listener = _c.value;
                listener.fn(instance, token, context);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
}
function runAfterAsync(token, instance, record, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var metadata, _a, _b, listener, e_4_1;
        var e_4, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    metadata = record.metadata || registry_1.HookMetadata.get(token);
                    if (!(metadata === null || metadata === void 0 ? void 0 : metadata.afterListeners)) return [3 /*break*/, 8];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 6, 7, 8]);
                    _a = tslib_1.__values(metadata.afterListeners), _b = _a.next();
                    _d.label = 2;
                case 2:
                    if (!!_b.done) return [3 /*break*/, 5];
                    listener = _b.value;
                    return [4 /*yield*/, listener.fn(instance, token, context)];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4:
                    _b = _a.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_4_1 = _d.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function runError(token, error, record, context) {
    var e_5, _a;
    var metadata = record.metadata || registry_1.HookMetadata.get(token);
    if (metadata === null || metadata === void 0 ? void 0 : metadata.errorHandlers) {
        try {
            for (var _b = tslib_1.__values(metadata.errorHandlers), _c = _b.next(); !_c.done; _c = _b.next()) {
                var handler = _c.value;
                var result = handler.fn(error, token, context);
                if (result !== undefined)
                    return result;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    }
    throw error;
}
function onDispose(token, instance, context) {
    var e_6, _a;
    var _b;
    var listeners = (_b = registry_1.HookMetadata.get(token)) === null || _b === void 0 ? void 0 : _b.disposeListeners;
    if (listeners === null || listeners === void 0 ? void 0 : listeners.length) {
        var promises = [];
        try {
            for (var listeners_1 = tslib_1.__values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
                var listener = listeners_1_1.value;
                var result = listener.fn(instance, context);
                if (result instanceof Promise)
                    promises.push(result);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        if (promises.length)
            return Promise.all(promises).then(function () { });
    }
}
