"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = Scope;
var registry_1 = require("../registry");
/**
 * Class decorator that declares which injector scope(s) a service can be resolved in.
 *
 * When a child injector with a different scope attempts to resolve this token,
 * the scope check hook rejects it (unless the scope is `'any'`).
 *
 * @param scope - The scope name (`'root'`, `'request'`, custom) or `'any'` to allow all scopes.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @Scope('request')
 * @Injectable()
 * class RequestContext { ... }
 *
 * @Scope('any')
 * @Injectable()
 * class SharedHelper { ... }
 * ```
 */
function Scope(scope) {
    return function (target) {
        registry_1.HookMetadata.hook(target, {
            onScopeCheck: function (definition, requestingScope) {
                return scope === 'any' || scope === requestingScope;
            }
        });
    };
}