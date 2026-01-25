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
export declare function deepForEach<T>(input: any, callback: (item: T) => void): void;
export declare const DEBUG_MODE: {
    enabled: boolean;
};
/**
 * Global policy configuration for the DI system.
 * Allows consumers to customize logging and strictness without modifying core code.
 */
export declare const InstantiationPolicy: {
    logger: {
        warn: (msg: string) => void;
    } | null;
    /** If true, treating async onInit in sync instantiation as a fatal error. */
    strictAsyncLifecycle: boolean;
    /** If true, prohibits adding providers to an already resolved multi-token. */
    strictMultiInjection: boolean;
};
export declare function debugLog(message: string, ...args: any[]): void;
export declare function enhanceError(e: any, token: any): any;
