import { __awaiter } from "tslib";
import { HookMetadata } from "../registry/index.js";
import { ResolveMode } from "../metadata/index.js";
import { debugLog as log, InstantiationPolicy, DEBUG_MODE, getSecureTokenName } from "../common/index.js";
import { runAfter, runAfterAsync, runBefore, runBeforeAsync, runError } from "./standard-hook.js";
import { guardCyclicDependency } from "./cyclic.js";
function getTokenName(token) {
    return getSecureTokenName(token);
}
function resolveMetadata(token, record) {
    if (record.metadata)
        return record.metadata;
    const metadata = HookMetadata.get(token);
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
    const name = getTokenName(token);
    const msg = `[DI] Warning: Service '${name}' has an async onInit(), but was instantiated synchronously. The initialization may not complete before usage.`;
    if (InstantiationPolicy.strictAsyncLifecycle) {
        throw new Error(msg.replace('Warning:', 'Error:'));
    }
    (_a = InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(msg);
}
export function isDisposable(instance) {
    return !!instance && typeof instance.destroy === 'function';
}
export function dispose(instance) {
    if (isDisposable(instance)) {
        return instance.destroy();
    }
}
export function instantiate(token, record, ctx) {
    const next = () => executeInstantiation(token, record, ctx);
    const instance = guardCyclicDependency(token, record, next);
    return applyInterceptorSync(instance, token, ctx);
}
export function executeInstantiation(token, record, ctx) {
    var _a, _b, _c;
    if (DEBUG_MODE.enabled) {
        log('instantiate', getTokenName(token));
    }
    const metadata = resolveMetadata(token, record);
    if (!metadata) {
        const instance = record.factory(ctx, ResolveMode.Sync);
        if (hasOnInit(instance)) {
            const result = instance.onInit();
            if (result instanceof Promise)
                reportAsyncLeak(token);
        }
        return instance;
    }
    if ((_a = metadata.beforeListeners) === null || _a === void 0 ? void 0 : _a.length) {
        runBefore(token, record, ctx);
    }
    let instance;
    const baseFactory = () => record.factory(ctx, ResolveMode.Sync);
    const effectiveFactory = metadata.customFactory
        ? () => metadata.customFactory(record, baseFactory, ctx)
        : baseFactory;
    if ((_b = metadata.errorHandlers) === null || _b === void 0 ? void 0 : _b.length) {
        try {
            instance = effectiveFactory();
        }
        catch (e) {
            instance = runError(token, e, record, ctx);
        }
    }
    else {
        instance = effectiveFactory();
    }
    if ((_c = metadata.afterListeners) === null || _c === void 0 ? void 0 : _c.length) {
        runAfter(token, instance, record, ctx);
    }
    if (hasOnInit(instance)) {
        const result = instance.onInit();
        if (result instanceof Promise) {
            reportAsyncLeak(token);
        }
    }
    return instance;
}
function applyInterceptorSync(instance, token, ctx) {
    const strategy = ctx.interceptStrategy;
    if (!strategy)
        return instance;
    const result = strategy(instance, token);
    if (result && typeof result.then === 'function') {
        const msg = `[DI] Error: Interceptor for '${getTokenName(token)}' returned a Promise in a synchronous resolution context. This is not allowed.`;
        throw new Error(msg);
    }
    return result !== undefined ? result : instance;
}
export function instantiateAsync(token, record, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const instance = yield executeInstantiationAsync(token, record, ctx);
        return applyInterceptorAsync(instance, token, ctx);
    });
}
export function executeInstantiationAsync(token, record, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const metadata = resolveMetadata(token, record);
        if (!metadata) {
            const instance = yield record.factory(ctx, ResolveMode.Async);
            if (hasOnInit(instance)) {
                const result = instance.onInit();
                if (result instanceof Promise)
                    yield result;
            }
            return instance;
        }
        if ((_a = metadata.beforeListeners) === null || _a === void 0 ? void 0 : _a.length) {
            yield runBeforeAsync(token, record, ctx);
        }
        let instance;
        const baseFactory = () => __awaiter(this, void 0, void 0, function* () { return record.factory(ctx, ResolveMode.Async); });
        const effectiveFactory = metadata.customFactory
            ? () => metadata.customFactory(record, baseFactory, ctx)
            : baseFactory;
        if ((_b = metadata.errorHandlers) === null || _b === void 0 ? void 0 : _b.length) {
            try {
                instance = yield effectiveFactory();
            }
            catch (e) {
                instance = runError(token, e, record, ctx);
            }
        }
        else {
            instance = yield effectiveFactory();
        }
        try {
            if ((_c = metadata.afterListeners) === null || _c === void 0 ? void 0 : _c.length) {
                yield runAfterAsync(token, instance, record, ctx);
            }
            if (hasOnInit(instance)) {
                const result = instance.onInit();
                if (result instanceof Promise) {
                    yield result;
                }
            }
        }
        catch (e) {
            if (instance && isDisposable(instance)) {
                try {
                    dispose(instance);
                }
                catch (disposeErr) {
                    (_e = (_d = InstantiationPolicy.logger) === null || _d === void 0 ? void 0 : _d.warn) === null || _e === void 0 ? void 0 : _e.call(_d, '[DI] Rollback disposal failed: ' + (disposeErr instanceof Error ? disposeErr.message : disposeErr));
                }
            }
            throw e;
        }
        return instance;
    });
}
function applyInterceptorAsync(instance, token, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const strategy = ctx.interceptStrategy;
        if (!strategy)
            return instance;
        const result = strategy(instance, token);
        if (result && typeof result.then === 'function') {
            const awaited = yield result;
            return awaited !== undefined ? awaited : instance;
        }
        return result !== undefined ? result : instance;
    });
}