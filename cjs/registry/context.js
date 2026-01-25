"use strict";
/**
 * @file core/context.ts
 * @description Manages the current injection context, allowing for global access to the active injector.
 * Supports AsyncLocalStorage for Node.js environments to prevent context pollution in concurrent requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInjector = getInjector;
exports.runInInjectionContext = runInInjectionContext;
exports.setInjector = setInjector;
exports.ɵɵInject = ɵɵInject;
exports.ɵɵInjectAsync = ɵɵInjectAsync;
var metadata_1 = require("../metadata");
// --- Implementation: Browser / Global Fallback ---
var GlobalStore = /** @class */ (function () {
    function GlobalStore() {
        this.active = null;
    }
    GlobalStore.prototype.get = function () { return this.active; };
    GlobalStore.prototype.run = function (injector, fn) {
        var prev = this.active;
        this.active = injector;
        try {
            return fn();
        }
        finally {
            this.active = prev;
        }
    };
    GlobalStore.prototype.enter = function (injector) {
        this.active = injector;
    };
    return GlobalStore;
}());
// --- Implementation: Node.js AsyncLocalStorage ---
function createNodeStore() {
    // Robust Node.js detection
    var isNode = typeof process !== 'undefined' &&
        process.versions != null &&
        process.versions.node != null;
    if (!isNode)
        return null;
    try {
        // 1. Try resolving a synchronous require function
        var _require = null;
        try {
            _require = typeof require !== 'undefined' ? require : undefined;
        }
        catch (_a) { }
        if (!_require && typeof module !== 'undefined' && module.require) {
            _require = module.require;
        }
        // 2. Load async_hooks
        var AsyncLocalStorage = void 0;
        if (_require) {
            // CJS or Shimmed Environment
            AsyncLocalStorage = _require('async_hooks').AsyncLocalStorage;
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            var createRequire = require('module').createRequire;
            var load = createRequire(process.cwd() + '/');
            AsyncLocalStorage = load('async_hooks').AsyncLocalStorage;
        }
        var als_1 = new AsyncLocalStorage();
        return {
            get: function () { return als_1.getStore() || null; },
            run: function (injector, fn) { return als_1.run(injector, fn); },
            enter: function (injector) {
                als_1.enterWith(injector);
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
var strategy = createNodeStore() || new GlobalStore();
// --- Public APIs ---
function getInjector() {
    return strategy.get();
}
/**
 * Executes the given function inside the context of the injector.
 * Preferred over setInjector for async safety.
 */
function runInInjectionContext(injector, fn) {
    return strategy.run(injector, fn);
}
/**
 * Sets the current injector.
 * @deprecated Use runInInjectionContext instead for better async safety in Node.js.
 */
function setInjector(active) {
    var prev = strategy.get();
    strategy.enter(active);
    return prev;
}
function ɵɵInject(token, flags) {
    var _a;
    var isForwardRef = typeof token === 'function' && token[metadata_1.DI_DECORATOR_FLAG] === metadata_1.FORWARD_REF;
    return (_a = getInjector()) === null || _a === void 0 ? void 0 : _a.get(isForwardRef ? token() : token, flags);
}
function ɵɵInjectAsync(token, flags) {
    var isForwardRef = typeof token === 'function' && token[metadata_1.DI_DECORATOR_FLAG] === metadata_1.FORWARD_REF;
    var t = isForwardRef ? token() : token;
    var injector = getInjector();
    return injector ? injector.getAsync(t, flags) : Promise.reject(new Error("No injector found for ".concat(t)));
}
