/**
 * @file features/scope.ts
 * @description Decorators for controlling the scope of injected services using Metadata Hooks.
 */
import { HookMetadata } from "../registry/index.js";
import { checkScope } from "../resolution/strategy.js";
export function Scope(scope) {
    return function (target) {
        HookMetadata.hook(target, {
            onScopeCheck: (def, requestingScope) => {
                if (scope === 'any')
                    return true;
                return checkScope(def, scope || requestingScope);
            }
        });
    };
}
