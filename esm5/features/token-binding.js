import { __read, __spreadArray } from "tslib";
/**
 * @file token-binding.ts
 * @description Provides @Token and @MultiToken decorators for simplified dependency binding.
 * This is an extension to the core DI system, leveraging `setInjectableDef` for metadata registration.
 * Note: Cyclic dependencies in the bound classes are handled by the core DI's `forwardRef` support (via `ɵɵInject`).
 * The `deps` resolution in `MultiToken` is lazy, ensuring all classes are registered before factory execution.
 */
import { setInjectableDef, ROOT_SCOPE, getInjectableDef } from "../metadata/index.js";
import { HookMetadata } from "../registry/index.js";
import { InstantiationPolicy } from "../common/index.js";
import { convertToFactory } from "../resolution/index.js";
var BINDING_TYPE = new WeakMap();
var MULTI_REGISTRY = new WeakMap();
export function Token(token, scope) {
    if (scope === void 0) { scope = ROOT_SCOPE; }
    return function (target) {
        var type = BINDING_TYPE.get(token);
        if (type === 'multi') {
            throw new Error("[DI Error] Token '".concat(token.toString(), "' is already used with @MultiToken. Cannot mix with @Token."));
        }
        if (!type) {
            BINDING_TYPE.set(token, 'single');
            registerConflictHook(token, 'single');
        }
        setInjectableDef(token, {
            providedIn: scope,
            useClass: target
        });
    };
}
export function MultiToken(token, scope) {
    if (scope === void 0) { scope = ROOT_SCOPE; }
    return function (target) {
        var type = BINDING_TYPE.get(token);
        if (type === 'single') {
            throw new Error("[DI Error] Token '".concat(token.toString(), "' is already used with @Token. Cannot mix with @MultiToken."));
        }
        if (!type) {
            BINDING_TYPE.set(token, 'multi');
            MULTI_REGISTRY.set(token, new Set());
            registerConflictHook(token, 'multi');
            setInjectableDef(token, { providedIn: scope });
            var def = getInjectableDef(token);
            if (def) {
                def.factory = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return convertToFactory(token, {
                        useFactory: function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            return args;
                        },
                        deps: Array.from(MULTI_REGISTRY.get(token))
                    }).apply(void 0, __spreadArray([], __read(args), false));
                };
            }
        }
        MULTI_REGISTRY.get(token).add(target);
    };
}
function registerConflictHook(token, type) {
    HookMetadata.hook(token, {
        onAllow: function (_token, provider) {
            var _a;
            if (provider && provider !== _token) {
                var msg = type === 'single'
                    ? "[DI Warning] \u26A0\uFE0F Explicit provider overrides implicit @Token binding for ".concat(_token.toString())
                    : "[DI Warning] \u26A0\uFE0F Explicit provider causes implicit @MultiToken bindings to be LOST for ".concat(_token.toString());
                (_a = InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(msg);
            }
            return true;
        }
    });
}
