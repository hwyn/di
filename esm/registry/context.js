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
    get() {
        return this.active;
    }
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
    // 1. Strict Node.js Environment Guard
    const isNode = typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null;
    if (!isNode)
        return null;
    try {
        const pkgName = 'async_hooks';
        let AlsClass;
        // 2. Dynamic Require Strategy to bypass bundler static analysis
        let nativeRequire;
        // A. Webpack-specific escape hatch
        // @ts-ignore
        if (typeof __non_webpack_require__ !== 'undefined') {
            // @ts-ignore
            nativeRequire = __non_webpack_require__;
        }
        // B. Try 'module.require' via string access to avoid static analysis detection
        // (Many bundlers ignore module['prop'] but catch module.prop)
        else if (typeof module !== 'undefined' && module['require']) {
            nativeRequire = module['require'];
        }
        // C. Fallback: try to eval('require') to break out of sandboxes
        else {
            try {
                nativeRequire = eval('require');
            }
            catch (e) { }
        }
        if (nativeRequire) {
            AlsClass = nativeRequire(pkgName).AsyncLocalStorage;
        }
        if (!AlsClass)
            return null;
        const als = new AlsClass();
        return {
            get: () => als.getStore() || null,
            run: (injector, fn) => als.run(injector, fn),
            enter: (injector) => {
                als.enterWith(injector);
            }
        };
    }
    catch (e) {
        throw new Error(`[DI] Fatal Error: Failed to load 'async_hooks' in Node.js environment. Context isolation is impossible.\nOriginal Error: ${e}`);
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