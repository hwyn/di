/**
 * @file features/scope.ts
 * @description Decorators for controlling the scope of injected services using Metadata Hooks.
 */
import { HookMetadata } from "../registry/index.js";
export function Scope(scope) {
    return function (target) {
        HookMetadata.hook(target, {
            onScopeCheck: function (definition, requestingScope) {
                return scope === 'any' || scope === requestingScope;
            }
        });
    };
}