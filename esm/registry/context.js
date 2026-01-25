/**
 * @file core/context.ts
 * @description Manages the current injection context, allowing for global access to the active injector.
 * Supports AsyncLocalStorage for Node.js environments to prevent context pollution in concurrent requests.
 */
import { FORWARD_REF, DI_DECORATOR_FLAG } from "../metadata/index.js";
// --- Implementation: Browser / Global Fallback ---
class GlobalStore {
    constructor() {
        this.active = null;
    }
    get() { return this.active; }
    run(injector, fn) {
        const prev = this.active;
        this.active = injector;
        try {
            return fn();
        }
        finally {
            this.active = prev;
        }
    }
    enter(injector) {
        this.active = injector;
    }
}
// --- Implementation: Node.js AsyncLocalStorage ---
function createNodeStore() {
    // Robust Node.js detection
    const isNode = typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null;
    if (!isNode)
        return null;
    try {
        // 1. Try resolving a synchronous require function
        let _require = null;
        try {
            _require = typeof require !== 'undefined' ? require : undefined;
        }
        catch (_a) { }
        if (!_require && typeof module !== 'undefined' && module.require) {
            _require = module.require;
        }
        // 2. Load async_hooks
        let AsyncLocalStorage;
        if (_require) {
            // CJS or Shimmed Environment
            AsyncLocalStorage = _require('async_hooks').AsyncLocalStorage;
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { createRequire } = require('module');
            const load = createRequire(process.cwd() + '/');
            AsyncLocalStorage = load('async_hooks').AsyncLocalStorage;
        }
        const als = new AsyncLocalStorage();
        return {
            get: () => als.getStore() || null,
            run: (injector, fn) => als.run(injector, fn),
            enter: (injector) => {
                als.enterWith(injector);
            }
        };
    }
    catch (e) {
        // Graceful fallback if anything fails (e.g. strict security policies, unpolyfilled environments)
        // InstantiationPolicy.logger?.warn('[DI] AsyncLocalStorage unavailable.', e);
        return null;
    }
}
// --- Initialization ---
// Prefer Node.js ALS if available, otherwise fallback to GlobalStore
const strategy = createNodeStore() || new GlobalStore();
// --- Public APIs ---
export function getInjector() {
    return strategy.get();
}
/**
 * Executes the given function inside the context of the injector.
 * Preferred over setInjector for async safety.
 */
export function runInInjectionContext(injector, fn) {
    return strategy.run(injector, fn);
}
/**
 * Sets the current injector.
 * @deprecated Use runInInjectionContext instead for better async safety in Node.js.
 */
export function setInjector(active) {
    const prev = strategy.get();
    strategy.enter(active);
    return prev;
}
export function ɵɵInject(token, flags) {
    var _a;
    const isForwardRef = typeof token === 'function' && token[DI_DECORATOR_FLAG] === FORWARD_REF;
    return (_a = getInjector()) === null || _a === void 0 ? void 0 : _a.get(isForwardRef ? token() : token, flags);
}
export function ɵɵInjectAsync(token, flags) {
    const isForwardRef = typeof token === 'function' && token[DI_DECORATOR_FLAG] === FORWARD_REF;
    const t = isForwardRef ? token() : token;
    const injector = getInjector();
    return injector ? injector.getAsync(t, flags) : Promise.reject(new Error(`No injector found for ${t}`));
}
