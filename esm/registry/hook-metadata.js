/**
 * @file university/di/registry/hook-metadata.ts
 * @description Utilities and metadata definitions for the Metadata-Driven Hook system.
 */
export const DI_HOOK_METADATA = Symbol.for('__di_hook_metadata__');
export class HookMetadata {
    static hook(target, options) {
        var _a;
        if (!target)
            return;
        const store = HookMetadata.getWritableStore(target);
        if (options.onScopeCheck) {
            if (store.onScopeCheck)
                throw new Error(`[HookMetadata] Duplicate scope strategy on ${target.name}`);
            store.onScopeCheck = options.onScopeCheck;
        }
        if (options.onTransientCheck !== undefined) {
            if (store.onTransientCheck !== undefined)
                throw new Error(`[HookMetadata] Duplicate transient strategy on ${target.name}`);
            store.onTransientCheck = options.onTransientCheck;
        }
        if (options.onAllow) {
            if (store.onAllow)
                throw new Error(`[HookMetadata] Duplicate allow strategy on ${target.name}`);
            store.onAllow = options.onAllow;
        }
        if (options.customFactory) {
            if (store.customFactory)
                throw new Error(`[HookMetadata] Duplicate factory strategy on ${target.name}`);
            store.customFactory = options.customFactory;
        }
        const order = (_a = options.order) !== null && _a !== void 0 ? _a : 0;
        if (options.before) {
            store.beforeListeners.push({ fn: options.before, order });
            store.beforeListeners.sort((a, b) => a.order - b.order);
        }
        if (options.after) {
            store.afterListeners.push({ fn: options.after, order });
            store.afterListeners.sort((a, b) => a.order - b.order);
        }
        if (options.onError) {
            store.errorHandlers.push({ fn: options.onError, order });
            store.errorHandlers.sort((a, b) => a.order - b.order);
        }
        if (options.onDispose) {
            store.disposeListeners.push({ fn: options.onDispose, order });
            store.disposeListeners.sort((a, b) => a.order - b.order);
        }
    }
    static get(target) {
        return target === null || target === void 0 ? void 0 : target[DI_HOOK_METADATA];
    }
    static getWritableStore(target) {
        if (!Object.prototype.hasOwnProperty.call(target, DI_HOOK_METADATA)) {
            const parentMeta = target[DI_HOOK_METADATA];
            const newStore = {
                onScopeCheck: parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.onScopeCheck,
                onTransientCheck: parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.onTransientCheck,
                onAllow: parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.onAllow,
                customFactory: parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.customFactory,
                beforeListeners: [...((parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.beforeListeners) || [])],
                afterListeners: [...((parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.afterListeners) || [])],
                errorHandlers: [...((parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.errorHandlers) || [])],
                disposeListeners: [...((parentMeta === null || parentMeta === void 0 ? void 0 : parentMeta.disposeListeners) || [])],
            };
            Object.defineProperty(target, DI_HOOK_METADATA, {
                value: newStore,
                writable: true,
                enumerable: false,
                configurable: true
            });
        }
        return target[DI_HOOK_METADATA];
    }
}