/**
 * @file resolution/cyclic.ts
 * @description Logic for handling cyclic dependencies via Proxy interception.
 */
import { RecordFlags } from "../metadata/index.js";
/**
 * Wraps the instantiation process with safeguards against cyclic dependencies.
 * If a cycle is detected, it returns a Proxy instead of the real instance (for supported providers).
 */
export function guardCyclicDependency(token, record, next) {
    if (record.flags & RecordFlags.MaskInstantiating) {
        return handleCyclicReference(record);
    }
    record.flags = (record.flags || 0) | RecordFlags.MaskInstantiating;
    try {
        const instance = next();
        if (record.flags & RecordFlags.MaskHasProxy) {
            linkProxyState(record, instance);
            record.flags &= ~RecordFlags.MaskHasProxy;
            record.__proxy__ = undefined;
        }
        return instance;
    }
    finally {
        record.flags &= ~RecordFlags.MaskInstantiating;
    }
}
function handleCyclicReference(record) {
    if (!record.__proxy__) {
        const type = record.factory.__type__;
        if (!type) {
            throw new Error(`[Cyclic] Cannot resolve type for proxy creation.\n` +
                `Cycle detected on ${record.factory.name || 'unknown factory'}.\n` +
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
            const v = target[p];
            return typeof v === 'function'
                ? function (...args) { return v.apply(this === proxy ? target : this, args); }
                : v;
        }
    });
    proxy[Symbol.for('__di_proxy_target__')] = (t) => {
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
    return proxy;
}
function linkProxyUtil(proxy, instance) {
    const setter = proxy[Symbol.for('__di_proxy_target__')];
    if (setter)
        setter(instance);
}