import { setInjectableDef, ROOT_SCOPE, getInjectableDef, ResolveMode, InjectFlags } from "../metadata/index.js";
import { HookMetadata, INJECTOR_SCOPE } from "../registry/index.js";
import { deepForEach, InstantiationPolicy, getSecureTokenName } from "../common/index.js";
import { resolveMulti, resolveMultiAsync } from "../resolution/index.js";
const TOKEN_BINDING_STATE = new WeakMap();
const FactoryBuilder = {
    create(token) {
        const state = TOKEN_BINDING_STATE.get(token);
        const isMulti = state.mode === 'multi';
        return (injector, mode) => {
            const currentScope = injector.get(INJECTOR_SCOPE, InjectFlags.Optional) || ROOT_SCOPE;
            const providers = this.fastFilterProviders(state.registry, currentScope);
            if (mode === ResolveMode.Async) {
                return resolveMultiAsync(token, providers, injector).then(results => isMulti ? results : results[0]);
            }
            const result = resolveMulti(token, providers, injector);
            if (result && typeof result.then === 'function') {
                return result.then((arr) => isMulti ? arr : arr[0]);
            }
            return isMulti ? result : result[0];
        };
    },
    fastFilterProviders(registrySet, scope) {
        const results = [];
        for (const entry of registrySet) {
            if (entry.scope === scope) {
                results.push(entry.provider);
            }
        }
        return results;
    }
};
function normalizeProvider(raw) {
    const provider = typeof raw === 'function' ? { provide: raw, useClass: raw } : raw;
    if (!provider || typeof provider !== 'object' || !('provide' in provider)) {
        throw new Error(`[DI Error] Invalid provider: missing 'provide' property.`);
    }
    if (InstantiationPolicy.activeEnv) {
        provider.env = InstantiationPolicy.activeEnv;
    }
    return {
        token: provider.provide,
        body: provider,
        isMulti: !!provider.multi
    };
}
function setHookMetadata(token, updates) {
    const existing = HookMetadata.get(token);
    if (existing) {
        Object.assign(existing, updates);
    }
    else {
        HookMetadata.hook(token, updates);
    }
}
function installTokenHooks(token, isDecorator) {
    setHookMetadata(token, {
        onScopeCheck: (_def, scope) => {
            const state = TOKEN_BINDING_STATE.get(token);
            if (!state)
                return false;
            for (const entry of state.registry) {
                if (entry.scope === scope)
                    return true;
            }
            return false;
        },
        onAllow: (_token, provider) => {
            var _a;
            if (token !== provider && isDecorator) {
                const name = getSecureTokenName(token);
                (_a = InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(`[DI Warning] ⚠️ Explicit provider overrides implicit @Token binding: ${name}`);
            }
            return true;
        }
    });
}
InstantiationPolicy.registerDebugTools({
    inspectToken: (token) => {
        const state = TOKEN_BINDING_STATE.get(token);
        if (!state)
            return null;
        return {
            mode: state.mode,
            providerCount: state.registry.size,
            scopes: Array.from(state.registry).map(entry => entry.scope),
            isBound: true
        };
    },
    resetToken: (token) => {
        TOKEN_BINDING_STATE.delete(token);
    }
});
/**
 * Programmatically registers one or more providers into the token-binding system.
 *
 * This is the imperative counterpart to `@Token()` / `@MultiToken()` decorators.
 * Registered providers are resolved lazily when the token is first requested from
 * an injector whose scope matches.
 *
 * @param input - A provider or array of providers to register.
 * @param scope - Scope for the registration (defaults to `'root'`).
 * @param isDecorator - @internal Whether this call originates from a decorator (affects warnings).
 *
 * @example
 * ```ts
 * register({ provide: API_TOKEN, useValue: '/api/v2' });
 * register([
 *   { provide: PLUGIN, multi: true, useClass: AuthPlugin },
 *   { provide: PLUGIN, multi: true, useClass: LogPlugin },
 * ], 'root');
 * ```
 */
export function register(input, scope = ROOT_SCOPE, isDecorator = false) {
    const providers = Array.isArray(input) ? input : [input];
    deepForEach(providers, (raw) => {
        var _a;
        const { token, body, isMulti } = normalizeProvider(raw);
        if (!TOKEN_BINDING_STATE.has(token)) {
            TOKEN_BINDING_STATE.set(token, {
                mode: isMulti ? 'multi' : 'single',
                registry: new Set()
            });
            let def = getInjectableDef(token);
            if (!def) {
                setInjectableDef(token, { scope });
                def = getInjectableDef(token);
            }
            if (def) {
                def.factory = FactoryBuilder.create(token);
                installTokenHooks(token, isDecorator);
            }
        }
        const state = TOKEN_BINDING_STATE.get(token);
        const existingMode = state.mode;
        if (isMulti && existingMode !== 'multi') {
            const msg = `[DI Error] Token '${token}' is Single, cannot add Multi provider.`;
            throw new Error(msg);
        }
        if (!isMulti && existingMode === 'multi') {
            const msg = `[DI Error] Token '${token}' is Multi, cannot add Single provider.`;
            throw new Error(msg);
        }
        if (existingMode === 'single') {
            if (state.registry.size > 0 && isDecorator) {
                (_a = InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(`[DI Warning] Token '${token}' binding overwritten by new decorator.`);
            }
            state.registry.clear();
        }
        state.registry.add({ provider: body, scope });
    });
}
function validateBinding(target, scope, token) {
    var _a, _b;
    const def = getInjectableDef(target);
    if (!def) {
        (_a = InstantiationPolicy.logger) === null || _a === void 0 ? void 0 : _a.warn(`[DI Warning] Missing @Injectable decorator for '${target.name}' (Token: ${String(token)}). Check decorator order.`);
    }
    else if (def.scope && def.scope !== scope) {
        (_b = InstantiationPolicy.logger) === null || _b === void 0 ? void 0 : _b.warn(`[DI Warning] Scope mismatch: '${target.name}' is '${def.scope}' but Token '${String(token)}' is '${scope}'.`);
    }
}
/**
 * Class decorator that binds a class to an `InjectorToken` as a single-value provider.
 *
 * When the token is resolved, the DI system returns this class's instance.
 * If another class also decorates with the same token, the later one overwrites
 * (with a dev-mode warning).
 *
 * @param token - The InjectorToken to bind to.
 * @param scope - Scope for the binding (defaults to `'root'`).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * const CACHE = InjectorToken.get<CacheService>('CACHE');
 *
 * @Token(CACHE)
 * @Injectable()
 * class RedisCacheService implements CacheService { ... }
 * ```
 */
export function Token(token, scope = ROOT_SCOPE) {
    return function (target) {
        validateBinding(target, scope, token);
        register({ provide: token, useExisting: target }, scope, true);
    };
}
/**
 * Class decorator that binds a class to an `InjectorToken` as a multi-value provider.
 *
 * Multiple classes can bind to the same token; resolving yields an array of all
 * registered implementations (scoped to the current injector's scope).
 *
 * @param token - The InjectorToken to bind to.
 * @param scope - Scope for the binding (defaults to `'root'`).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * const PLUGINS = InjectorToken.get<Plugin[]>('PLUGINS');
 *
 * @MultiToken(PLUGINS)
 * @Injectable()
 * class AuthPlugin implements Plugin { ... }
 *
 * @MultiToken(PLUGINS)
 * @Injectable()
 * class LogPlugin implements Plugin { ... }
 *
 * // Resolving PLUGINS returns [AuthPlugin, LogPlugin]
 * ```
 */
export function MultiToken(token, scope = ROOT_SCOPE) {
    return function (target) {
        validateBinding(target, scope, token);
        register({ provide: token, multi: true, useExisting: target }, scope);
    };
}