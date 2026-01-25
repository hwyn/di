/**
 * @file core/token-registry.ts
 * @description A strongly-typed, scope-isolated registry for collecting global types/tokens with lazy merging and defensive caching.
 */
import { __decorate } from "tslib";
import { Injectable, InjectorToken, ROOT_SCOPE } from "../metadata/index.js";
import { deepForEach } from "../common/index.js";
const EMPTY_FROZEN_ARRAY = Object.freeze([]);
let TokenRegistry = class TokenRegistry {
    constructor() {
        this._scopes = new Set();
        this._chunks = new Map();
        this._cache = new Map();
    }
    static createScope(desc, options) {
        const scope = InjectorToken.get(desc);
        // @ts-ignore
        scope.options = Object.assign({ multi: true, allowOverride: false }, options);
        tokenRegistry.defineScope(scope);
        return scope;
    }
    static register(scope, items) {
        tokenRegistry.register(scope, items);
    }
    static getOne(scope) {
        return tokenRegistry.getOne(scope);
    }
    static getAll(scope) {
        return tokenRegistry.getAll(scope);
    }
    static deleteScope(scope) {
        tokenRegistry.deleteScope(scope);
    }
    defineScope(scope) {
        this._scopes.add(scope);
    }
    register(scope, items) {
        if (!this._scopes.has(scope)) {
            throw new Error(`[TokenRegistry] Scope ${scope.toString()} is not defined. Use TokenRegistry.createScope() first.`);
        }
        if (this._cache.has(scope)) {
            this._cache.delete(scope);
        }
        let bucket = this._chunks.get(scope);
        if (!bucket) {
            bucket = [];
            this._chunks.set(scope, bucket);
        }
        const { multi, allowOverride } = scope.options;
        if (!multi) {
            if (Array.isArray(items)) {
                throw new Error(`[TokenRegistry] Scope ${scope.toString()} is single-value but received an array.`);
            }
            if (bucket.length > 0) {
                if (!allowOverride) {
                    throw new Error(`[TokenRegistry] Scope ${scope.toString()} is single-value and restrict override.`);
                }
                bucket.length = 0;
            }
        }
        bucket.push(items);
    }
    getOne(scope) {
        const all = this.getAll(scope);
        return all.length > 0 ? all[all.length - 1] : undefined;
    }
    getAll(scope) {
        const cached = this._cache.get(scope);
        if (cached) {
            return cached;
        }
        const rawBucket = this._chunks.get(scope);
        if (!rawBucket || rawBucket.length === 0) {
            this._cache.set(scope, EMPTY_FROZEN_ARRAY);
            return EMPTY_FROZEN_ARRAY;
        }
        const resultSet = new Set();
        deepForEach(rawBucket, (item) => resultSet.add(item));
        const resultArr = Object.freeze(Array.from(resultSet));
        this._cache.set(scope, resultArr);
        this._chunks.set(scope, [resultArr]);
        return resultArr;
    }
    deleteScope(scope) {
        this._scopes.delete(scope);
        this._chunks.delete(scope);
        this._cache.delete(scope);
    }
    clear(scope) {
        this.deleteScope(scope);
    }
    _debug() {
        return Array.from(this._chunks.entries()).map(([scope, chunks]) => ({
            scope: scope.toString(),
            writeOps: chunks.length,
            hasCache: this._cache.has(scope)
        }));
    }
};
TokenRegistry = __decorate([
    Injectable({ providedIn: ROOT_SCOPE, useFactory: () => tokenRegistry })
], TokenRegistry);
export { TokenRegistry };
const tokenRegistry = new TokenRegistry();
