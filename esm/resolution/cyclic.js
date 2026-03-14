import { RecordFlags } from "../metadata/index.js";
const PROXY_TARGET = Symbol.for('__di_proxy_target__');
export function guardCyclicDependency(token, record, next) {
    const rec = record;
    if (rec.flags & RecordFlags.MaskInstantiating) {
        return handleCyclicReference(rec);
    }
    rec.flags = (rec.flags || 0) | RecordFlags.MaskInstantiating;
    try {
        const instance = next();
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
        const type = (_a = record.factory) === null || _a === void 0 ? void 0 : _a.__type__;
        if (!type) {
            throw new Error(`[Cyclic] Cannot resolve type for proxy creation.\n` +
                `Cycle detected on ${((_b = record.factory) === null || _b === void 0 ? void 0 : _b.name) || 'unknown factory'}.\n` +
                `Note: 'useFactory' providers do not support cyclic dependencies.`);
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
    let target = Object.create(type.prototype || Object.prototype);
    const proxy = new Proxy(target, {
        set: (_, p, v) => (target[p] = v, true),
        get: (_, p) => {
            if (p === PROXY_TARGET)
                return (t) => {
                    if (typeof type === 'function' && !(t instanceof type)) {
                        throw new Error(`[Cyclic] Factory output mismatch.\n` +
                            `The 'useFactory' provider for '${type.name || 'unknown'}' returned an object that is not an instance of the token.\n` +
                            `When cyclic dependencies are present, the factory must return an instance of the token class.`);
                    }
                    const conflicts = [];
                    for (const key of Object.keys(target)) {
                        if (Object.prototype.hasOwnProperty.call(t, key) && t[key] !== target[key]) {
                            conflicts.push(key);
                        }
                    }
                    if (conflicts.length > 0) {
                        console.warn(`[Cyclic] Warning: Property conflict detected for '${type.name || 'unknown'}'.\n` +
                            `The following properties initialized in the constructor were overwritten due to cyclic dependency resolution: ${conflicts.join(', ')}.\n` +
                            `This may cause unexpected behavior.`);
                    }
                    Object.assign(t, target);
                    target = t;
                };
            const v = target[p];
            return typeof v === 'function'
                ? function (...args) { return v.apply(this === proxy ? target : this, args); }
                : v;
        }
    });
    return proxy;
}
function linkProxyUtil(proxy, instance) {
    const setter = proxy[PROXY_TARGET];
    if (typeof setter === 'function')
        setter(instance);
}