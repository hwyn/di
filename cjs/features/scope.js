"use strict";
/**
 * @file features/scope.ts
 * @description Decorators for controlling the scope of injected services using Metadata Hooks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = Scope;
var registry_1 = require("../registry");
function Scope(scope) {
    return function (target) {
        registry_1.HookMetadata.hook(target, {
            onScopeCheck: function (definition, requestingScope) {
                return scope === 'any' || scope === requestingScope;
            }
        });
    };
}