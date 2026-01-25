/**
 * @file core/context.ts
 * @description Manages the current injection context, allowing for global access to the active injector.
 * Supports AsyncLocalStorage for Node.js environments to prevent context pollution in concurrent requests.
 */
import { Injector } from './injector';
export declare function getInjector(): Injector | null;
/**
 * Executes the given function inside the context of the injector.
 * Preferred over setInjector for async safety.
 */
export declare function runInInjectionContext<T>(injector: Injector, fn: () => T): T;
/**
 * Sets the current injector.
 * @deprecated Use runInInjectionContext instead for better async safety in Node.js.
 */
export declare function setInjector(active: Injector | null): Injector | null;
export declare function ɵɵInject(token: any, flags?: any): any;
export declare function ɵɵInjectAsync(token: any, flags?: any): Promise<any>;
