/**
 * @file impl/static-injector.ts
 * @description Concrete implementation of the Injector class (StaticInjector), managing scope and resolution.
 */
import { __awaiter } from "tslib";
import { getInjector, Injector, INJECTOR, INJECTOR_SCOPE, runInInjectionContext, INTERCEPTORS } from "../registry/index.js";
import { InjectFlags, NO_VALUE, RecordFlags } from "../metadata/index.js";
import { deepForEach, debugLog as log, DEBUG_MODE, enhanceError, InstantiationPolicy } from "../common/index.js";
import { dispose, instantiate, instantiateAsync, isDisposable } from "./instantiator.js";
import { makeRecord, resolveMulti, composeInterceptors, resolveDefinition, resolveMultiAsync } from "./strategy.js";
import { AsyncGovernance } from "./async-governance.js";
import { onTransientCheck, onDispose, onAdmission } from "./standard-hook.js";
import { checkNoProvider, checkSelfAndOptional, validateResolution, validateSkipSelf } from "./resolution-checks.js";
import { ContextualInjector } from "./contextual-injector.js";
export { InjectFlags } from "../metadata/index.js";
export function deepProviders(injector, providers) {
    deepForEach(providers, (item) => {
        var _a;
        injector.set((_a = item.provide) !== null && _a !== void 0 ? _a : item, item);
    });
}
export class StaticInjector {
    get destroyed() { return this.isDestroyed; }
    constructor(additionalProviders, parent) {
        var _a, _b;
        this.isDestroyed = false;
        this.onDestroy = new Map();
        this.records = new Map();
        this.interceptStrategy = null;
        this.parent = parent;
        deepProviders(this, additionalProviders);
        this.records.set(INJECTOR, makeRecord(() => this, this));
        this.scope = this.get(INJECTOR_SCOPE, InjectFlags.Optional | InjectFlags.Self);
        const localInterceptors = this.get(INTERCEPTORS, InjectFlags.Optional | InjectFlags.Self);
        const parentStrategy = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.interceptStrategy) !== null && _b !== void 0 ? _b : null;
        this.interceptStrategy = composeInterceptors(localInterceptors, parentStrategy, this);
    }
    get(token, flags = InjectFlags.Default) {
        DEBUG_MODE.enabled && log('get', token.name || token);
        const { value, record } = this.resolveBoundaryOrCache(token, flags, (p, f) => p.get(token, f));
        if (value !== NO_VALUE)
            return value;
        if (record) {
            AsyncGovernance.enforceLock(record, token.name || token);
        }
        if (record === null)
            return this.tryParent(token, flags, null);
        const prev = getInjector();
        if (prev === this)
            return this.tryResolve(token, record, flags);
        return runInInjectionContext(this, () => {
            try {
                return this.tryResolve(token, record, flags);
            }
            catch (e) {
                throw enhanceError(e, token);
            }
        });
    }
    getAsync(token_1) {
        return __awaiter(this, arguments, void 0, function* (token, flags = InjectFlags.Default, resolutionStack = new Set()) {
            DEBUG_MODE.enabled && log('getAsync', token.name || token);
            const { value, record } = this.resolveBoundaryOrCache(token, flags, (p, f) => p.getAsync(token, f));
            if (value !== NO_VALUE)
                return value;
            if (resolutionStack.has(token)) {
                throw new Error(`Cyclic dependency detected in async resolution: ${Array.from(resolutionStack).map(t => t.name || t).join(' -> ')} -> ${token.name || token}`);
            }
            if (record && record.resolving) {
                return record.resolving;
            }
            if (record === null)
                return this.tryParentAsync(token, flags, null, resolutionStack);
            const prev = getInjector();
            if (prev === this)
                return this.tryResolveAsync(token, record, flags);
            resolutionStack.add(token);
            const ctx = new ContextualInjector(this, resolutionStack);
            return runInInjectionContext(this, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield this.tryResolveAsync(token, record, flags, ctx);
                }
                catch (e) {
                    throw enhanceError(e, token);
                }
                finally {
                    resolutionStack.delete(token);
                }
            }));
        });
    }
    set(token, provider) {
        var _a;
        if (onAdmission(token, provider || token, this) === false)
            return null;
        const isMulti = provider.multi;
        if (isMulti) {
            let record = this.records.get(token);
            if (record && (record.value !== NO_VALUE || record.resolving)) {
                const msg = `[DI] Warning: Trying to add a provider to an already resolved multi-token '${token.name || token}'. This provider will be ignored.`;
                if (InstantiationPolicy.strictMultiInjection) {
                    throw new Error(msg.replace('Warning:', 'Error:'));
                }
                (_a = InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(msg);
                return;
            }
            if (!record || !record.multi) {
                record = makeRecord((ctx) => resolveMulti(token, record.multi, ctx), NO_VALUE, true);
                this.records.set(token, record);
            }
            record.multi.push(provider);
        }
        else {
            const record = this.records.get(token);
            if (record && record.value !== NO_VALUE) {
                throw new Error(`[DI] Error: Cannot overwrite provider for '${token.name || token}' because it has already been instantiated.`);
            }
            this.records.set(token, { factory: undefined, value: NO_VALUE, multi: undefined, provider });
        }
    }
    resolveBoundaryOrCache(token, flags, delegate) {
        if (this.isDestroyed)
            return { value: null, record: undefined };
        if (flags & InjectFlags.SkipSelf) {
            validateSkipSelf(flags);
            if (this.parent)
                return { value: delegate(this.parent, flags & ~InjectFlags.SkipSelf), record: undefined };
            return { value: checkNoProvider(token, flags), record: undefined };
        }
        const record = this.records.get(token);
        if (record &&
            record.value !== NO_VALUE &&
            !((flags & RecordFlags.MaskFromChild) && (record.flags & RecordFlags.Private)) &&
            !onTransientCheck(token, record, this)) {
            return { value: record.value, record };
        }
        return { value: NO_VALUE, record };
    }
    destroy() {
        if (this.isDestroyed)
            return;
        this.isDestroyed = true;
        const promises = [];
        const entries = Array.from(this.onDestroy).reverse();
        for (const [service, token] of entries) {
            const result = onDispose(token, service, this);
            if (result instanceof Promise)
                promises.push(result);
            const p = dispose(service);
            if (p instanceof Promise)
                promises.push(p);
        }
        if (promises.length) {
            return Promise.allSettled(promises).then(() => this.cleanup());
        }
        this.cleanup();
    }
    cleanup() {
        this.onDestroy.clear();
        this.parent = undefined;
        this.records.clear();
    }
    getRecord(token) {
        return this.records.get(token);
    }
    tryParent(token, flags, record) {
        var _a;
        checkSelfAndOptional(token, flags, record);
        return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.get(token, flags | RecordFlags.MaskFromChild);
    }
    tryParentAsync(token, flags, record, stack) {
        var _a;
        checkSelfAndOptional(token, flags, record);
        if (this.parent instanceof StaticInjector && stack) {
            return this.parent.getAsync(token, flags | RecordFlags.MaskFromChild, stack);
        }
        return (_a = this.parent) === null || _a === void 0 ? void 0 : _a.getAsync(token, flags | RecordFlags.MaskFromChild);
    }
    tryResolve(token, record, flags) {
        record = this.resolveRecord(token, record);
        validateResolution(token, record, flags);
        if (record)
            return this.hydrateSync(token, record);
        if (this.parent)
            return this.tryParent(token, flags, record);
        if (flags & InjectFlags.Optional)
            return null;
        throw new Error(`No provider for ${token.name || token}`);
    }
    tryResolveAsync(token, record, flags, ctx = this) {
        record = this.resolveRecord(token, record);
        validateResolution(token, record, flags);
        if (record)
            return this.hydrateAsync(token, record, ctx);
        if (this.parent) {
            const stack = ctx instanceof ContextualInjector ? ctx.stack : undefined;
            return this.tryParentAsync(token, flags, record, stack);
        }
        if (flags & InjectFlags.Optional)
            return null;
        throw new Error(`No provider for ${token.name || token}`);
    }
    resolveRecord(token, record) {
        if (record === null)
            return null;
        if (record === null || record === void 0 ? void 0 : record.factory)
            return record;
        const resolved = resolveDefinition(token, record, this.scope, this);
        this.records.set(token, resolved);
        return resolved;
    }
    hydrateSync(token, record) {
        AsyncGovernance.enforceLock(record, token.toString());
        const value = instantiate(token, record, this);
        if (value instanceof Promise && !(record.provider && 'useValue' in record.provider)) {
            AsyncGovernance.enforceSyncConstraint(token);
        }
        return this.finishHydrate(token, record, value);
    }
    hydrateAsync(token_1, record_1) {
        return __awaiter(this, arguments, void 0, function* (token, record, ctx = this) {
            const worker = record.multi ? resolveMultiAsync(token, record.multi, this) : instantiateAsync(token, record, ctx);
            const value = yield AsyncGovernance.governLifecycle(record, worker);
            if (this.isDestroyed) {
                if (record.multi) {
                    for (const item of value) {
                        if (isDisposable(item))
                            dispose(item);
                    }
                }
                else if (isDisposable(value)) {
                    dispose(value);
                }
                throw new Error(`Injector destroyed during resolution of: ${token}`);
            }
            return this.finishHydrate(token, record, value);
        });
    }
    finishHydrate(token, record, value) {
        if (onTransientCheck(token, record, this))
            return value;
        record.value = value;
        this.registerDispose(token, value, record);
        return value;
    }
    registerDispose(token, value, record) {
        if (record.multi) {
            for (const item of value) {
                if (isDisposable(item))
                    this.onDestroy.set(item, token);
            }
        }
        else if (isDisposable(value) && !(value instanceof StaticInjector)) {
            this.onDestroy.set(value, token);
        }
    }
}
Injector.create = function createInjector(providers, parent) {
    return new StaticInjector(providers, parent);
};