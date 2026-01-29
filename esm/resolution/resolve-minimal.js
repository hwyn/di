/**
 * @file impl/resolve-minimal.ts
 * @description Provides a lightweight, standalone resolution mechanism (useful for testing or simple scopes).
 */
import { __awaiter } from "tslib";
import { INJECTOR, runInInjectionContext } from "../registry/index.js";
import { IGNORE_SCOPE, RecordFlags } from "../metadata/index.js";
import { dispose, instantiate, instantiateAsync, isDisposable } from "./instantiator.js";
import { resolveDefinition } from "./strategy.js";
import { onDispose, onTransientCheck } from "./standard-hook.js";
const NOOP = () => { };
function findParentRecord(cursor, t) {
    var _a;
    while (cursor) {
        const r = (_a = cursor.getRecord) === null || _a === void 0 ? void 0 : _a.call(cursor, t);
        if (r && !((r.flags || 0) & RecordFlags.Private)) {
            return r;
        }
        cursor = cursor.parent;
    }
    return undefined;
}
export function resolveMinimal(token, parent) {
    const cache = new Map();
    const active = [];
    const sandbox = {
        set: NOOP,
        destroy: NOOP,
        destroyed: false,
        get: (t) => resolve(t),
    };
    function resolve(t) {
        if (t === INJECTOR)
            return sandbox;
        const c = cache.get(t);
        if (c !== undefined)
            return c;
        const r = findParentRecord(parent, t);
        let record = resolveDefinition(t, r, IGNORE_SCOPE, sandbox);
        if (!record)
            return null;
        if (onTransientCheck(t, record, sandbox)) {
            return instantiate(t, record, sandbox);
        }
        const val = instantiate(t, record, sandbox);
        if (record.multi) {
            val.forEach(v => isDisposable(v) && active.push({ instance: v, token: t }));
        }
        else {
            isDisposable(val) && active.push({ instance: val, token: t });
        }
        if (val != null)
            cache.set(t, val);
        return val || null;
    }
    return runInInjectionContext(sandbox, () => {
        return [resolve(token), () => {
                const promises = [];
                while (active.length) {
                    const { instance, token } = active.pop();
                    const ret = onDispose(token, instance, sandbox);
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
        function resolve(t) {
            return __awaiter(this, void 0, void 0, function* () {
                if (t === INJECTOR)
                    return sandbox;
                const c = cache.get(t);
                if (c !== undefined)
                    return c;
                const r = findParentRecord(parent, t);
                let record = resolveDefinition(t, r, IGNORE_SCOPE, sandbox);
                if (!record)
                    return null;
                if (onTransientCheck(t, record, sandbox)) {
                    return instantiateAsync(t, record, sandbox);
                }
                const valPromise = instantiateAsync(t, record, sandbox);
                cache.set(t, valPromise);
                // We await here to ensure we return the value, but caching the promise allows concurrent requests to wait for same instantiation
                const val = yield valPromise;
                // Update cache with value if desired, or leave promise. Leaving promise is standard for simple async caches to avoid race conditions.
                // However, for active tracking we need the instance.
                if (val && typeof val === 'object' && (isDisposable(val) || record.flags === RecordFlags.Private)) {
                    active.push({ instance: val, token: t });
                }
                return val;
            });
        }
        return runInInjectionContext(sandbox, () => __awaiter(this, void 0, void 0, function* () {
            const instance = yield resolve(token);
            return [instance, () => __awaiter(this, void 0, void 0, function* () {
                    const promises = [];
                    while (active.length) {
                        const item = active.pop();
                        cache.delete(item.token);
                        const h = onDispose(item.token, item.instance, sandbox);
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