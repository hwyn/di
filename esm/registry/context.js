import { AsyncLocalStorage } from 'async_hooks';
import { FORWARD_REF, DI_DECORATOR_FLAG } from "../metadata/index.js";
class GlobalStore {
    constructor() {
        this.active = null;
        this.asyncWarningShown = false;
    }
    get() {
        return this.active;
    }
    run(injector, fn) {
        const prev = this.active;
        this.active = injector;
        try {
            const result = fn();
            if (result instanceof Promise && !this.asyncWarningShown) {
                this.asyncWarningShown = true;
                console.warn('[DI] Warning: runInInjectionContext() detected async operation in browser environment.\n' +
                    'Context isolation is NOT guaranteed for async code without Zone.js or AsyncLocalStorage.\n' +
                    'Consider: 1) Passing injector explicitly, 2) Using Zone.js, 3) Running in Node.js server.');
            }
            return result;
        }
        finally {
            this.active = prev;
        }
    }
    enter(injector) {
        this.active = injector;
    }
}
function createNodeStore() {
    const isNode = typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null;
    if (!isNode)
        return null;
    try {
        const pkgName = 'async_hooks';
        let AlsClass;
        let nativeRequire;
        if (typeof AsyncLocalStorage === 'undefined') {
            if (typeof __non_webpack_require__ !== 'undefined') {
                nativeRequire = __non_webpack_require__;
            }
            else if (typeof module !== 'undefined' && module['require']) {
                nativeRequire = module['require'];
            }
            if (nativeRequire) {
                AlsClass = nativeRequire(pkgName).AsyncLocalStorage;
            }
        }
        else {
            AlsClass = AsyncLocalStorage;
        }
        if (!AlsClass)
            throw new Error('[DI] Fatal Error: AsyncLocalStorage could not be loaded.');
        const als = new AlsClass();
        return {
            get: () => { var _a; return (_a = als.getStore()) !== null && _a !== void 0 ? _a : null; },
            run: (injector, fn) => als.run(injector, fn),
            enter: (injector) => {
                als.enterWith(injector);
            }
        };
    }
    catch (e) {
        const msg = `[DI] Fatal Error: Failed to load 'async_hooks' in Node.js environment. Context isolation is impossible.\nOriginal Error: ${e}`;
        throw new Error(msg);
    }
}
const strategy = createNodeStore() || new GlobalStore();
/**
 * Returns the currently active injector from the injection context, or `null` if none.
 *
 * In Node.js, this reads from `AsyncLocalStorage`. In the browser, from the global store.
 * Typically used inside `runInInjectionContext()` callbacks.
 */
export function getInjector() {
    return strategy.get();
}
/**
 * Executes a function within the injection context of a specific injector.
 *
 * Inside `fn`, calls to `ɵɵInject()` and `getInjector()` return tokens resolved
 * from the provided injector. In Node.js, context isolation uses `AsyncLocalStorage`,
 * ensuring safety across async boundaries. In the browser, a global store is used
 * (async safety requires Zone.js or explicit injector passing).
 *
 * @typeParam T - The return type of the callback.
 * @param injector - The injector to activate as the current context.
 * @param fn - The function to execute within the injection context.
 * @returns The return value of `fn`.
 *
 * @example
 * ```ts
 * const value = runInInjectionContext(injector, () => {
 *   return ɵɵInject(MyService);  // resolves from `injector`
 * });
 * ```
 */
export function runInInjectionContext(injector, fn) {
    return strategy.run(injector, fn);
}
/**
 * @internal
 * Synchronously resolves a token from the current injection context.
 * Used by generated code and internal framework machinery.
 *
 * @param token - The injection token or a `ForwardRefFn`.
 * @param flags - Optional {@link InjectFlags}.
 */
export function ɵɵInject(token, flags) {
    const injector = getInjector();
    if (!injector) {
        throw new Error(`[DI] No injection context found when resolving token. Ensure this code runs inside runInInjectionContext() or during injector resolution.`);
    }
    const isForwardRef = typeof token === 'function' && token[DI_DECORATOR_FLAG] === FORWARD_REF;
    return injector.get(isForwardRef ? token() : token, flags);
}
/**
 * @internal
 * Asynchronously resolves a token from the current injection context.
 * Used by generated code and internal framework machinery.
 *
 * @param token - The injection token or a `ForwardRefFn`.
 * @param flags - Optional {@link InjectFlags}.
 * @returns A Promise resolving to the instance.
 */
export function ɵɵInjectAsync(token, flags) {
    const isForwardRef = typeof token === 'function' && token[DI_DECORATOR_FLAG] === FORWARD_REF;
    const t = isForwardRef ? token() : token;
    const injector = getInjector();
    return injector ? injector.getAsync(t, flags) : Promise.reject(new Error(`No injector found for ${t}`));
}