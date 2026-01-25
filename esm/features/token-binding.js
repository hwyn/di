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
const BINDING_TYPE = new WeakMap();
const MULTI_REGISTRY = new WeakMap();
export function Token(token, scope = ROOT_SCOPE) {
    return function (target) {
        const type = BINDING_TYPE.get(token);
        if (type === 'multi') {
            throw new Error(`[DI Error] Token '${token.toString()}' is already used with @MultiToken. Cannot mix with @Token.`);
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
export function MultiToken(token, scope = ROOT_SCOPE) {
    return function (target) {
        const type = BINDING_TYPE.get(token);
        if (type === 'single') {
            throw new Error(`[DI Error] Token '${token.toString()}' is already used with @Token. Cannot mix with @MultiToken.`);
        }
        if (!type) {
            BINDING_TYPE.set(token, 'multi');
            MULTI_REGISTRY.set(token, new Set());
            registerConflictHook(token, 'multi');
            setInjectableDef(token, { providedIn: scope });
            const def = getInjectableDef(token);
            if (def) {
                def.factory = (...args) => convertToFactory(token, {
                    useFactory: (...args) => args,
                    deps: Array.from(MULTI_REGISTRY.get(token))
                })(...args);
            }
        }
        MULTI_REGISTRY.get(token).add(target);
    };
}
function registerConflictHook(token, type) {
    HookMetadata.hook(token, {
        onAllow: (_token, provider) => {
            var _a;
            if (provider && provider !== _token) {
                const msg = type === 'single'
                    ? `[DI Warning] ⚠️ Explicit provider overrides implicit @Token binding for ${_token.toString()}`
                    : `[DI Warning] ⚠️ Explicit provider causes implicit @MultiToken bindings to be LOST for ${_token.toString()}`;
                (_a = InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(msg);
            }
            return true;
        }
    });
}
