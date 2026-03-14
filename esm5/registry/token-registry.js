import { __assign, __decorate, __read } from "tslib";
import { Injectable, InjectorToken, ROOT_SCOPE } from "../metadata/index.js";
import { deepForEach } from "../common/index.js";
var EMPTY_FROZEN_ARRAY = Object.freeze([]);
/**
 * Global, scope-grouped value registry.
 *
 * `TokenRegistry` organises arbitrary values into named scopes. Each scope is
 * created with `createScope()` and can be configured as single-value or
 * multi-value. Values are registered with `register()` and retrieved with
 * `getOne()` / `getAll()`.
 *
 * All public operations are exposed as **static** methods that delegate to a
 * module-level singleton, so no injector is needed to use the registry.
 * The class is also `@Injectable` so it can be injected where an instance
 * reference is preferred.
 *
 * Results are cached after the first read; subsequent `register()` calls
 * invalidate the cache automatically.
 *
 * @example
 * ```ts
 * // 1. Define a scope
 * const PLUGINS = TokenRegistry.createScope<PluginDef>('PLUGINS');
 *
 * // 2. Register values (may be nested arrays)
 * TokenRegistry.register(PLUGINS, [pluginA, pluginB]);
 *
 * // 3. Retrieve
 * const all = TokenRegistry.getAll(PLUGINS);   // ReadonlyArray<PluginDef>
 * const one = TokenRegistry.getOne(PLUGINS);   // last registered value
 * ```
 */
var TokenRegistry = /** @class */ (function () {
    function TokenRegistry() {
        this._scopes = new Set();
        this._chunks = new Map();
        this._cache = new Map();
    }
    /**
     * Creates a new typed scope handle.
     *
     * @typeParam T - The type of values stored under this scope.
     * @param desc - Human-readable description (used by `InjectorToken.get()`).
     * @param options - Scope configuration. Defaults to `{ multi: true, allowOverride: false }`.
     * @returns A `RegistryScope<T>` handle for use with `register` / `getOne` / `getAll`.
     */
    TokenRegistry.createScope = function (desc, options) {
        var scope = InjectorToken.get(desc);
        scope.options = __assign({ multi: true, allowOverride: false }, options);
        tokenRegistry.defineScope(scope);
        return scope;
    };
    /**
     * Registers one or more values into a scope.
     *
     * Accepts a single value or an arbitrarily nested array. For single-value
     * scopes (`multi: false`), passing an array or registering twice without
     * `allowOverride` throws.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle created by `createScope()`.
     * @param items - Value(s) to register.
     */
    TokenRegistry.register = function (scope, items) {
        tokenRegistry.register(scope, items);
    };
    /**
     * Returns the last registered value for the given scope, or `undefined` if empty.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle.
     */
    TokenRegistry.getOne = function (scope) {
        return tokenRegistry.getOne(scope);
    };
    /**
     * Returns all registered values for the given scope as a frozen array.
     *
     * Results are deduplicated and cached until the next `register()` call.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle.
     * @returns A `ReadonlyArray<T>` (may be empty).
     */
    TokenRegistry.getAll = function (scope) {
        return tokenRegistry.getAll(scope);
    };
    /**
     * Removes a scope and all its registered values.
     *
     * @param scope - The scope handle to delete.
     */
    TokenRegistry.deleteScope = function (scope) {
        tokenRegistry.deleteScope(scope);
    };
    /**
     * Marks a scope as defined so that `register()` will accept it.
     *
     * Called automatically by `createScope()`. Only needed when setting up a
     * scope on a non-default `TokenRegistry` instance.
     *
     * @param scope - The scope handle to define.
     */
    TokenRegistry.prototype.defineScope = function (scope) {
        this._scopes.add(scope);
    };
    /**
     * Registers value(s) into a previously defined scope.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle (must have been defined via `defineScope` or `createScope`).
     * @param items - Value(s) to store.
     * @throws If the scope is not defined, or violates single-value / override constraints.
     */
    TokenRegistry.prototype.register = function (scope, items) {
        if (!this._scopes.has(scope)) {
            var msg = "[TokenRegistry] Scope ".concat(scope.toString(), " is not defined. Use TokenRegistry.createScope() first.");
            throw new Error(msg);
        }
        if (this._cache.has(scope)) {
            this._cache.delete(scope);
        }
        var bucket = this._chunks.get(scope);
        if (!bucket) {
            bucket = [];
            this._chunks.set(scope, bucket);
        }
        var _a = scope.options, multi = _a.multi, allowOverride = _a.allowOverride;
        if (!multi) {
            if (Array.isArray(items)) {
                var msg = "[TokenRegistry] Scope ".concat(scope.toString(), " is single-value but received an array.");
                throw new Error(msg);
            }
            if (bucket.length > 0) {
                if (!allowOverride) {
                    var msg = "[TokenRegistry] Scope ".concat(scope.toString(), " is single-value and restrict override.");
                    throw new Error(msg);
                }
                bucket.length = 0;
            }
        }
        bucket.push(items);
    };
    /**
     * Returns the last registered value, or `undefined` if the scope is empty.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle.
     */
    TokenRegistry.prototype.getOne = function (scope) {
        var all = this.getAll(scope);
        return all.length > 0 ? all[all.length - 1] : undefined;
    };
    /**
     * Returns all registered values as a frozen, deduplicated array.
     *
     * Caches the result until the next `register()` call on this scope.
     *
     * @typeParam T - The value type of the scope.
     * @param scope - The scope handle.
     * @returns A `ReadonlyArray<T>` (empty frozen array if nothing was registered).
     */
    TokenRegistry.prototype.getAll = function (scope) {
        var cached = this._cache.get(scope);
        if (cached) {
            return cached;
        }
        var rawBucket = this._chunks.get(scope);
        if (!rawBucket || rawBucket.length === 0) {
            this._cache.set(scope, EMPTY_FROZEN_ARRAY);
            return EMPTY_FROZEN_ARRAY;
        }
        var resultSet = new Set();
        deepForEach(rawBucket, function (item) { return resultSet.add(item); });
        var resultArr = Object.freeze(Array.from(resultSet));
        this._cache.set(scope, resultArr);
        this._chunks.set(scope, [resultArr]);
        return resultArr;
    };
    /**
     * Removes a scope and all associated data (chunks + cache).
     *
     * @param scope - The scope handle to delete.
     */
    TokenRegistry.prototype.deleteScope = function (scope) {
        this._scopes.delete(scope);
        this._chunks.delete(scope);
        this._cache.delete(scope);
    };
    /** Alias for {@link deleteScope}. Removes the scope and all its data. */
    TokenRegistry.prototype.clear = function (scope) {
        this.deleteScope(scope);
    };
    /** @internal Returns diagnostic info for each registered scope (for debugging). */
    TokenRegistry.prototype._debug = function () {
        var _this = this;
        return Array.from(this._chunks.entries()).map(function (_a) {
            var _b = __read(_a, 2), scope = _b[0], chunks = _b[1];
            return ({
                scope: scope.toString(),
                writeOps: chunks.length,
                hasCache: _this._cache.has(scope)
            });
        });
    };
    TokenRegistry = __decorate([
        Injectable({ scope: ROOT_SCOPE, useFactory: function () { return tokenRegistry; } })
    ], TokenRegistry);
    return TokenRegistry;
}());
export { TokenRegistry };
var tokenRegistry = new TokenRegistry();