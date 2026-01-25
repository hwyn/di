/**
 * @file core/utils.ts
 * @description Shared utility functions for the DI system.
 */
/**
 * Iterates over a potentially nested array structure (depth-first),
 * invoking the callback for each non-array item.
 *
 * Checks for `undefined` and `null` values and skips them.
 *
 * @param input The item or array of items to iterate.
 * @param callback The function to call for each leaf item.
 */
export function deepForEach(input, callback) {
    if (!Array.isArray(input)) {
        if (input !== undefined && input !== null) {
            callback(input);
        }
        return;
    }
    const stack = [input];
    while (stack.length) {
        const item = stack.pop();
        if (Array.isArray(item)) {
            for (let i = item.length - 1; i >= 0; i--) {
                stack.push(item[i]);
            }
        }
        else if (item !== undefined && item !== null) {
            callback(item);
        }
    }
}
export const DEBUG_MODE = { enabled: false };
/**
 * Global policy configuration for the DI system.
 * Allows consumers to customize logging and strictness without modifying core code.
 */
export const InstantiationPolicy = {
    logger: (typeof console !== 'undefined' ? console : null),
    /** If true, treating async onInit in sync instantiation as a fatal error. */
    strictAsyncLifecycle: true,
    /** If true, prohibits adding providers to an already resolved multi-token. */
    strictMultiInjection: true,
};
export function debugLog(message, ...args) {
    if (DEBUG_MODE.enabled) {
        console.debug(`[DI] ${message}`, ...args);
    }
}
export function enhanceError(e, token) {
    if (e instanceof Error) {
        const name = token.name || token.toString();
        e.message = `${e.message}  -> ${name}`;
    }
    return e;
}
