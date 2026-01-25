/**
 * @file features/scope.ts
 * @description Decorators for controlling the scope of injected services using Metadata Hooks.
 */
export declare function Scope(scope: 'any' | 'root' | string): (target: any) => void;
