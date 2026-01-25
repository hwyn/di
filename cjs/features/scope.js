"use strict";
/**
 * @file features/scope.ts
 * @description Decorators for controlling the scope of injected services using Metadata Hooks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = Scope;
var registry_1 = require("../registry");
var strategy_1 = require("../resolution/strategy");
function Scope(scope) {
    return function (target) {
        registry_1.HookMetadata.hook(target, {
            onScopeCheck: function (def, requestingScope) {
                if (scope === 'any')
                    return true;
                return (0, strategy_1.checkScope)(def, scope || requestingScope);
            }
        });
    };
}
