"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantiationPolicy = exports.DEBUG_MODE = void 0;
exports.deepForEach = deepForEach;
exports.debugLog = debugLog;
exports.getSecureTokenName = getSecureTokenName;
exports.enhanceError = enhanceError;
var tslib_1 = require("tslib");
function deepForEach(input, callback) {
    if (!Array.isArray(input)) {
        if (input !== undefined && input !== null) {
            callback(input);
        }
        return;
    }
    var stack = [input];
    while (stack.length) {
        var item = stack.pop();
        if (Array.isArray(item)) {
            for (var i = item.length - 1; i >= 0; i--) {
                stack.push(item[i]);
            }
        }
        else if (item !== undefined && item !== null) {
            callback(item);
        }
    }
}
/**
 * Debug switch for DI resolution logging.
 *
 * Set `DEBUG_MODE.enabled = true` to output detailed resolution traces to `console.debug`.
 * Disabled by default; intended for development troubleshooting.
 *
 * @example
 * ```ts
 * import { DEBUG_MODE } from '@hwy-fm/di';
 * DEBUG_MODE.enabled = true;  // enable verbose DI logs
 * ```
 */
exports.DEBUG_MODE = { enabled: false };
/**
 * Global policy configuration for the DI system.
 *
 * Provides centralized control over logging, timeouts, strictness, and extension points.
 * Modify these settings before bootstrapping to customize DI behavior.
 *
 * @example
 * ```ts
 * import { InstantiationPolicy } from '@hwy-fm/di';
 *
 * // Increase async timeout to 30 seconds
 * InstantiationPolicy.TIMEOUT = 30000;
 *
 * // Disable strict async lifecycle (allow async onInit in sync get())
 * InstantiationPolicy.strictAsyncLifecycle = false;
 *
 * // Add a global admission policy
 * InstantiationPolicy.globalAdmission = (token, provider, injector) => {
 *   return !blockedTokens.has(token);
 * };
 * ```
 */
exports.InstantiationPolicy = {
    /** Logger used for DI warnings and debug output. Set to `null` to suppress. */
    logger: (typeof console !== 'undefined' ? console : null),
    /** Default async resolution timeout in milliseconds. Throws after this duration. */
    TIMEOUT: 10000,
    strictPerformance: true,
    /** If `true`, treats async `onInit()` during synchronous `get()` as a fatal error. */
    strictAsyncLifecycle: true,
    /** If `true`, prohibits adding providers to an already-resolved multi-token. */
    strictMultiInjection: true,
    /** Active environment context for conditional provider registration. */
    activeEnv: null,
    /** Global admission gate invoked before every provider registration. Return `false` to block. */
    globalAdmission: null,
    // Helper to register debug tools safely
    registerDebugTools: function (tools) {
        if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
            var self = exports.InstantiationPolicy;
            self.debugTools = Object.assign(self.debugTools || {}, tools);
        }
    }
};
function debugLog(message) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (exports.DEBUG_MODE.enabled) {
        console.debug.apply(console, tslib_1.__spreadArray(["[DI] ".concat(message)], tslib_1.__read(args), false));
    }
}
var IS_PRODUCTION = typeof process !== 'undefined' && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) === 'production';
function getSecureTokenName(token) {
    if (IS_PRODUCTION)
        return '[Token]';
    if (token == null)
        return '[Unknown Token]';
    if (typeof token === 'string')
        return token;
    if (typeof token !== 'object' && typeof token !== 'function')
        return String(token);
    return ('name' in token ? token.name : null) || token.toString();
}
function enhanceError(e, token) {
    if (e instanceof Error) {
        var name = getSecureTokenName(token);
        e.message = "".concat(e.message, "  -> ").concat(name);
    }
    return e;
}