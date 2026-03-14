import { __values } from "tslib";
import { RecordFlags } from "../metadata/index.js";
var PROXY_TARGET = Symbol.for('__di_proxy_target__');
export function guardCyclicDependency(token, record, next) {
    var rec = record;
    if (rec.flags & RecordFlags.MaskInstantiating) {
        return handleCyclicReference(rec);
    }
    rec.flags = (rec.flags || 0) | RecordFlags.MaskInstantiating;
    try {
        var instance = next();
        if (rec.flags & RecordFlags.MaskHasProxy) {
            linkProxyState(rec, instance);
            rec.flags &= ~RecordFlags.MaskHasProxy;
            rec.__proxy__ = undefined;
        }
        return instance;
    }
    finally {
        rec.flags &= ~RecordFlags.MaskInstantiating;
    }
}
function handleCyclicReference(record) {
    var _a, _b;
    if (!record.__proxy__) {
        var type = (_a = record.factory) === null || _a === void 0 ? void 0 : _a.__type__;
        if (!type) {
            throw new Error("[Cyclic] Cannot resolve type for proxy creation.\n" +
                "Cycle detected on ".concat(((_b = record.factory) === null || _b === void 0 ? void 0 : _b.name) || 'unknown factory', ".\n") +
                "Note: 'useFactory' providers do not support cyclic dependencies.");
        }
        record.__proxy__ = createProxyUtil(type);
        record.flags |= RecordFlags.MaskHasProxy;
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
            if (p === PROXY_TARGET)
                return function (t) {
                    var e_1, _a;
                    if (typeof type === 'function' && !(t instanceof type)) {
                        throw new Error("[Cyclic] Factory output mismatch.\n" +
                            "The 'useFactory' provider for '".concat(type.name || 'unknown', "' returned an object that is not an instance of the token.\n") +
                            "When cyclic dependencies are present, the factory must return an instance of the token class.");
                    }
                    var conflicts = [];
                    try {
                        for (var _b = __values(Object.keys(target)), _c = _b.next(); !_c.done; _c = _b.next()) {
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
    return proxy;
}
function linkProxyUtil(proxy, instance) {
    var setter = proxy[PROXY_TARGET];
    if (typeof setter === 'function')
        setter(instance);
}