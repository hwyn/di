"use strict";
/**
 * @file core/token-registry.ts
 * @description A strongly-typed, scope-isolated registry for collecting global types/tokens with lazy merging and defensive caching.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRegistry = void 0;
var tslib_1 = require("tslib");
var metadata_1 = require("../metadata");
var common_1 = require("../common");
var EMPTY_FROZEN_ARRAY = Object.freeze([]);
var TokenRegistry = /** @class */ (function () {
    function TokenRegistry() {
        this._scopes = new Set();
        this._chunks = new Map();
        this._cache = new Map();
    }
    TokenRegistry.createScope = function (desc, options) {
        var scope = metadata_1.InjectorToken.get(desc);
        // @ts-ignore
        scope.options = tslib_1.__assign({ multi: true, allowOverride: false }, options);
        tokenRegistry.defineScope(scope);
        return scope;
    };
    TokenRegistry.register = function (scope, items) {
        tokenRegistry.register(scope, items);
    };
    TokenRegistry.getOne = function (scope) {
        return tokenRegistry.getOne(scope);
    };
    TokenRegistry.getAll = function (scope) {
        return tokenRegistry.getAll(scope);
    };
    TokenRegistry.deleteScope = function (scope) {
        tokenRegistry.deleteScope(scope);
    };
    TokenRegistry.prototype.defineScope = function (scope) {
        this._scopes.add(scope);
    };
    TokenRegistry.prototype.register = function (scope, items) {
        if (!this._scopes.has(scope)) {
            throw new Error("[TokenRegistry] Scope ".concat(scope.toString(), " is not defined. Use TokenRegistry.createScope() first."));
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
                throw new Error("[TokenRegistry] Scope ".concat(scope.toString(), " is single-value but received an array."));
            }
            if (bucket.length > 0) {
                if (!allowOverride) {
                    throw new Error("[TokenRegistry] Scope ".concat(scope.toString(), " is single-value and restrict override."));
                }
                bucket.length = 0;
            }
        }
        bucket.push(items);
    };
    TokenRegistry.prototype.getOne = function (scope) {
        var all = this.getAll(scope);
        return all.length > 0 ? all[all.length - 1] : undefined;
    };
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
        (0, common_1.deepForEach)(rawBucket, function (item) { return resultSet.add(item); });
        var resultArr = Object.freeze(Array.from(resultSet));
        this._cache.set(scope, resultArr);
        this._chunks.set(scope, [resultArr]);
        return resultArr;
    };
    TokenRegistry.prototype.deleteScope = function (scope) {
        this._scopes.delete(scope);
        this._chunks.delete(scope);
        this._cache.delete(scope);
    };
    TokenRegistry.prototype.clear = function (scope) {
        this.deleteScope(scope);
    };
    TokenRegistry.prototype._debug = function () {
        var _this = this;
        return Array.from(this._chunks.entries()).map(function (_a) {
            var _b = tslib_1.__read(_a, 2), scope = _b[0], chunks = _b[1];
            return ({
                scope: scope.toString(),
                writeOps: chunks.length,
                hasCache: _this._cache.has(scope)
            });
        });
    };
    TokenRegistry = tslib_1.__decorate([
        (0, metadata_1.Injectable)({ scope: metadata_1.ROOT_SCOPE, useFactory: function () { return tokenRegistry; } })
    ], TokenRegistry);
    return TokenRegistry;
}());
exports.TokenRegistry = TokenRegistry;
var tokenRegistry = new TokenRegistry();