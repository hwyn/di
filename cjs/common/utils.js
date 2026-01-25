"use strict";
/**
 * @file core/utils.ts
 * @description Shared utility functions for the DI system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantiationPolicy = exports.DEBUG_MODE = void 0;
exports.deepForEach = deepForEach;
exports.debugLog = debugLog;
exports.enhanceError = enhanceError;
var tslib_1 = require("tslib");
/**
 * Iterates over a potentially nested array structure (depth-first),
 * invoking the callback for each non-array item.
 *
 * Checks for `undefined` and `null` values and skips them.
 *
 * @param input The item or array of items to iterate.
 * @param callback The function to call for each leaf item.
 */
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
exports.DEBUG_MODE = { enabled: false };
/**
 * Global policy configuration for the DI system.
 * Allows consumers to customize logging and strictness without modifying core code.
 */
exports.InstantiationPolicy = {
    logger: (typeof console !== 'undefined' ? console : null),
    /** If true, treating async onInit in sync instantiation as a fatal error. */
    strictAsyncLifecycle: true,
    /** If true, prohibits adding providers to an already resolved multi-token. */
    strictMultiInjection: true,
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
function enhanceError(e, token) {
    if (e instanceof Error) {
        var name_1 = token.name || token.toString();
        e.message = "".concat(e.message, "  -> ").concat(name_1);
    }
    return e;
}
