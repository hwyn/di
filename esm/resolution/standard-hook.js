/**
 * @file university/di/resolution/standard-hook.ts
 * @description Standard implementations for Metadata-Driven Hooks.
 */
import { __awaiter } from "tslib";
import { HookMetadata } from "../registry/index.js";
export function onAdmission(token, provider, context) {
    var _a;
    const hook = (_a = HookMetadata.get(token)) === null || _a === void 0 ? void 0 : _a.onAllow;
    if (hook) {
        return hook(token, provider, context);
    }
}
export function onScopeCheck(definition, scope, context) {
    var _a;
    const hook = (_a = HookMetadata.get(definition.token)) === null || _a === void 0 ? void 0 : _a.onScopeCheck;
    if (hook) {
        return hook(definition, scope, context);
    }
}
export function onTransientCheck(token, record, context) {
    var _a, _b, _c;
    const strategy = (_b = (_a = record.metadata) === null || _a === void 0 ? void 0 : _a.onTransientCheck) !== null && _b !== void 0 ? _b : (_c = HookMetadata.get(token)) === null || _c === void 0 ? void 0 : _c.onTransientCheck;
    if (strategy !== undefined) {
        return typeof strategy === 'function' ? strategy(token, record, context) : strategy;
    }
}
export function runCustomFactory(token, record, next, context) {
    const metadata = record.metadata || HookMetadata.get(token);
    return (metadata === null || metadata === void 0 ? void 0 : metadata.customFactory) ? () => metadata.customFactory(record, next, context) : next;
}
export function runBefore(token, record, context) {
    const metadata = record.metadata || HookMetadata.get(token);
    if (metadata === null || metadata === void 0 ? void 0 : metadata.beforeListeners) {
        for (const listener of metadata.beforeListeners) {
            listener.fn(token, record, context);
        }
    }
}
export function runBeforeAsync(token, record, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const metadata = record.metadata || HookMetadata.get(token);
        if (metadata === null || metadata === void 0 ? void 0 : metadata.beforeListeners) {
            for (const listener of metadata.beforeListeners) {
                yield listener.fn(token, record, context);
            }
        }
    });
}
export function runAfter(token, instance, record, context) {
    const metadata = record.metadata || HookMetadata.get(token);
    if (metadata === null || metadata === void 0 ? void 0 : metadata.afterListeners) {
        for (const listener of metadata.afterListeners) {
            listener.fn(instance, token, context);
        }
    }
}
export function runAfterAsync(token, instance, record, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const metadata = record.metadata || HookMetadata.get(token);
        if (metadata === null || metadata === void 0 ? void 0 : metadata.afterListeners) {
            for (const listener of metadata.afterListeners) {
                yield listener.fn(instance, token, context);
            }
        }
    });
}
export function runError(token, error, record, context) {
    const metadata = record.metadata || HookMetadata.get(token);
    if (metadata === null || metadata === void 0 ? void 0 : metadata.errorHandlers) {
        for (const handler of metadata.errorHandlers) {
            const result = handler.fn(error, token, context);
            if (result !== undefined)
                return result;
        }
    }
    throw error;
}
export function onDispose(token, instance, context) {
    var _a;
    const listeners = (_a = HookMetadata.get(token)) === null || _a === void 0 ? void 0 : _a.disposeListeners;
    if (listeners === null || listeners === void 0 ? void 0 : listeners.length) {
        const promises = [];
        for (const listener of listeners) {
            const result = listener.fn(instance, context);
            if (result instanceof Promise)
                promises.push(result);
        }
        if (promises.length)
            return Promise.all(promises).then(() => { });
    }
}
