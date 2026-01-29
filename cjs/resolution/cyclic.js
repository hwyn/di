"use strict";
/**
 * @file resolution/cyclic.ts
 * @description Logic for handling cyclic dependencies via Proxy interception.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardCyclicDependency = guardCyclicDependency;
var tslib_1 = require("tslib");
var metadata_1 = require("../metadata");
/**
 * Wraps the instantiation process with safeguards against cyclic dependencies.
 * If a cycle is detected, it returns a Proxy instead of the real instance (for supported providers).
 */
function guardCyclicDependency(token, record, next) {
    if (record.flags & metadata_1.RecordFlags.MaskInstantiating) {
        return handleCyclicReference(record);
    }
    record.flags = (record.flags || 0) | metadata_1.RecordFlags.MaskInstantiating;
    try {
        var instance = next();
        if (record.flags & metadata_1.RecordFlags.MaskHasProxy) {
            linkProxyState(record, instance);
            record.flags &= ~metadata_1.RecordFlags.MaskHasProxy;
            record.__proxy__ = undefined;
        }
        return instance;
    }
    finally {
        record.flags &= ~metadata_1.RecordFlags.MaskInstantiating;
    }
}
function handleCyclicReference(record) {
    if (!record.__proxy__) {
        var type = record.factory.__type__;
        if (!type) {
            throw new Error("[Cyclic] Cannot resolve type for proxy creation.\n" +
                "Cycle detected on ".concat(record.factory.name || 'unknown factory', ".\n") +
                "Note: 'useFactory' providers do not support cyclic dependencies.");
        }
        record.__proxy__ = createProxyUtil(type);
        record.flags |= metadata_1.RecordFlags.MaskHasProxy;
    }
    return record.__proxy__;
}
function linkProxyState(record, instance) {
    if (record.__proxy__) {
        linkProxyUtil(record.__proxy__, instance);
    }
}
function createProxyUtil(type) {
    var target = Object.create(type.prototype || Object.prototype);
    var proxy = new Proxy(target, {
        set: function (_, p, v) { return (target[p] = v, true); },
        get: function (_, p) {
            var v = target[p];
            return typeof v === 'function'
                ? function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return v.apply(this === proxy ? target : this, args);
                }
                : v;
        }
    });
    proxy[Symbol.for('__di_proxy_target__')] = function (t) {
        var e_1, _a;
        if (typeof type === 'function' && !(t instanceof type)) {
            throw new Error("[Cyclic] Factory output mismatch.\n" +
                "The 'useFactory' provider for '".concat(type.name || 'unknown', "' returned an object that is not an instance of the token.\n") +
                "When cyclic dependencies are present, the factory must return an instance of the token class.");
        }
        var conflicts = [];
        try {
            for (var _b = tslib_1.__values(Object.keys(target)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                if (Object.prototype.hasOwnProperty.call(t, key) && t[key] !== target[key]) {
                    conflicts.push(key);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (conflicts.length > 0) {
            console.warn("[Cyclic] Warning: Property conflict detected for '".concat(type.name || 'unknown', "'.\n") +
                "The following properties initialized in the constructor were overwritten due to cyclic dependency resolution: ".concat(conflicts.join(', '), ".\n") +
                "This may cause unexpected behavior.");
        }
        Object.assign(t, target);
        target = t;
    };
    return proxy;
}
function linkProxyUtil(proxy, instance) {
    var setter = proxy[Symbol.for('__di_proxy_target__')];
    if (setter)
        setter(instance);
}