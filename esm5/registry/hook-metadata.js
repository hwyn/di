/**
 * @file university/di/registry/hook-metadata.ts
 * @description Utilities and metadata definitions for the Metadata-Driven Hook system.
 */
import { __read, __spreadArray } from "tslib";
export var DI_HOOK_METADATA = Symbol.for('__di_hook_metadata__');
var HookMetadata = /** @class */ (function () {
    function HookMetadata() {
    }
    HookMetadata.hook = function (target, options) {
        var _a;
        if (!target)
            return;
        var store = HookMetadata.getWritableStore(target);
        if (options.onScopeCheck) {
            if (store.onScopeCheck)
                throw new Error("[HookMetadata] Duplicate scope strategy on ".concat(target.name));
            store.onScopeCheck = options.onScopeCheck;
        }
        if (options.onTransientCheck !== undefined) {
            if (store.onTransientCheck !== undefined)
                throw new Error("[HookMetadata] Duplicate transient strategy on ".concat(target.name));
            store.onTransientCheck = options.onTransientCheck;
        }
        if (options.onAllow) {
            if (store.onAllow)
                throw new Error("[HookMetadata] Duplicate allow strategy on ".concat(target.name));
            store.onAllow = options.onAllow;
        }
        if (options.customFactory) {
            if (store.customFactory)
                throw new Error("[HookMetadata] Duplicate factory strategy on ".concat(target.name));
            store.customFactory = options.customFactory;
        }
        var order = (_a = options.order) !== null && _a !== void 0 ? _a : 0;
        if (options.before) {
            store.beforeListeners.push({ fn: options.before, order: order });
            store.beforeListeners.sort(function (a, b) { return a.order - b.order; });
        }
        if (options.after) {
            store.afterListeners.push({ fn: options.after, order: order });
            store.afterListeners.sort(function (a, b) { return a.order - b.order; });
        }
        if (options.onError) {
            store.errorHandlers.push({ fn: options.onError, order: order });
            store.errorHandlers.sort(function (a, b) { return a.order - b.order; });
        }
        if (options.onDispose) {
            store.disposeListeners.push({ fn: options.onDispose, order: order });
            store.disposeListeners.sort(function (a, b) { return a.order - b.order; });
        }
    };
    HookMetadata.get = function (target) {
        return target === null || target === void 0 ? void 0 : target[DI_HOOK_METADATA];
    };
    HookMetadata.getWritableStore = function (target) {
        if (!Object.prototype.hasOwnProperty.call(target, DI_HOOK_METADATA)) {
            var parentMeta = target[DI_HOOK_METADATA];
            var newStore = {
                onScopeCheck: parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.onScopeCheck,
                onTransientCheck: parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.onTransientCheck,
                onAllow: parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.onAllow,
                customFactory: parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.customFactory,
                beforeListeners: __spreadArray([], __read(((parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.beforeListeners) || [])), false),
                afterListeners: __spreadArray([], __read(((parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.afterListeners) || [])), false),
                errorHandlers: __spreadArray([], __read(((parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.errorHandlers) || [])), false),
                disposeListeners: __spreadArray([], __read(((parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.disposeListeners) || [])), false),
            };
            Object.defineProperty(target, DI_HOOK_METADATA, {
                value: newStore,
                writable: true,
                enumerable: false,
                configurable: true
            });
        }
        return target[DI_HOOK_METADATA];
    };
    return HookMetadata;
}());
export { HookMetadata };
