import { __awaiter } from "tslib";
import { INJECTOR, runInInjectionContext } from "../registry/index.js";
import { IGNORE_SCOPE, RecordFlags } from "../metadata/index.js";
import { dispose, instantiate, instantiateAsync, isDisposable } from "./instantiator.js";
import { resolveDefinition } from "./strategy.js";
import { onDispose, onTransientCheck } from "./standard-hook.js";
const NOOP = () => { };
function findParentRecord(cursor, token) {
    var _a;
    let current = cursor;
    while (current) {
        const r = (_a = current.getRecord) === null || _a === void 0 ? void 0 : _a.call(current, token);
        if (r && !((r.flags || 0) & RecordFlags.Private)) {
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
export function resolveMinimal(token, parent) {
    const cache = new Map();
    const active = [];
    const sandbox = {
        set: NOOP,
        destroy: NOOP,
        destroyed: false,
        get: (t) => resolve(t),
    };
    const injector = sandbox;
    function resolve(t) {
        if (t === INJECTOR)
            return injector;
        const c = cache.get(t);
        if (c !== undefined)
            return c;
        const r = findParentRecord(parent, t);
        const record = resolveDefinition(t, r, IGNORE_SCOPE, injector);
        if (!record)
            return null;
        if (onTransientCheck(t, record, injector)) {
            return instantiate(t, record, injector);
        }
        const val = instantiate(t, record, injector);
        if (record.multi) {
            val.forEach(v => isDisposable(v) && active.push({ instance: v, token: t }));
        }
        else {
            isDisposable(val) && active.push({ instance: val, token: t });
        }
        if (val != null)
            cache.set(t, val);
        return val !== null && val !== void 0 ? val : null;
    }
    return runInInjectionContext(injector, () => {
        return [resolve(token), () => {
                const promises = [];
                while (active.length) {
                    const { instance, token: tk } = active.pop();
                    const ret = onDispose(tk, instance, injector);
                    if (ret instanceof Promise)
                        promises.push(ret);
                    const p = dispose(instance);
                    if (p instanceof Promise)
                        promises.push(p);
                }
                if (promises.length)
                    return Promise.all(promises).then(() => { });
            }];
    });
}
/** Async version of resolveMinimal. */
export function resolveMinimalAsync(token, parent) {
    return __awaiter(this, void 0, void 0, function* () {
        const cache = new Map();
        const active = [];
        const sandbox = {
            set: NOOP,
            destroy: NOOP,
            destroyed: false,
            get: (t) => resolve(t),
            getAsync: (t) => resolve(t),
        };
        const injector = sandbox;
        function resolve(t) {
            return __awaiter(this, void 0, void 0, function* () {
                if (t === INJECTOR)
                    return injector;
                const c = cache.get(t);
                if (c !== undefined)
                    return c;
                const r = findParentRecord(parent, t);
                const record = resolveDefinition(t, r, IGNORE_SCOPE, injector);
                if (!record)
                    return null;
                if (onTransientCheck(t, record, injector)) {
                    return instantiateAsync(t, record, injector);
                }
                const valPromise = instantiateAsync(t, record, injector);
                cache.set(t, valPromise);
                const val = yield valPromise;
                if (val && typeof val === 'object' && (isDisposable(val) || record.flags === RecordFlags.Private)) {
                    active.push({ instance: val, token: t });
                }
                return val;
            });
        }
        return runInInjectionContext(injector, () => __awaiter(this, void 0, void 0, function* () {
            const instance = yield resolve(token);
            return [instance, () => __awaiter(this, void 0, void 0, function* () {
                    const promises = [];
                    while (active.length) {
                        const item = active.pop();
                        cache.delete(item.token);
                        const h = onDispose(item.token, item.instance, injector);
                        if (h instanceof Promise)
                            promises.push(h);
                        const d = dispose(item.instance);
                        if (d instanceof Promise)
                            promises.push(d);
                    }
                    if (promises.length)
                        yield Promise.all(promises);
                })];
        }));
    });
}