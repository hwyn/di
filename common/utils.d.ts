import type { TokenKey, Provider } from '../metadata/provider';
import type { Injector } from '../registry/injector';
export declare function deepForEach<T>(input: unknown, callback: (item: T) => void): void;
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
export declare const DEBUG_MODE: {
    enabled: boolean;
};
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
export declare const InstantiationPolicy: {
    /** Logger used for DI warnings and debug output. Set to `null` to suppress. */
    logger: {
        warn: (msg: string) => void;
        log?: (msg: string) => void;
    } | null;
    /** Default async resolution timeout in milliseconds. Throws after this duration. */
    TIMEOUT: number;
    strictPerformance: boolean;
    /** If `true`, treats async `onInit()` during synchronous `get()` as a fatal error. */
    strictAsyncLifecycle: boolean;
    /** If `true`, prohibits adding providers to an already-resolved multi-token. */
    strictMultiInjection: boolean;
    /** Active environment context for conditional provider registration. */
    activeEnv: string | null;
    /** Global admission gate invoked before every provider registration. Return `false` to block. */
    globalAdmission: ((token: TokenKey, provider: Provider, injector: Injector) => boolean) | null;
    registerDebugTools: (tools: Record<string, Function>) => void;
};
export declare function debugLog(message: string, ...args: unknown[]): void;
export declare function getSecureTokenName(token: TokenKey | string): string;
export declare function enhanceError(e: unknown, token: TokenKey): unknown;
