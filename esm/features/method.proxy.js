/**
 * @file features/method.proxy.ts
 * @description Experimental feature for AOP-style method interception and proxying.
 */
import { __decorate } from "tslib";
import { resolveParams } from "../resolution/index.js";
import { Injectable, IS_PROXY, NATIVE_METHOD, Reflector } from "../metadata/index.js";
const SYSTEM_CALL_MARKER = Symbol('__DI_SYS_CALL__');
let MethodProxy = class MethodProxy {
    constructor() {
        this.SYSTEM_CALL_MARKER = SYSTEM_CALL_MARKER;
    }
    createSystemInvoker(instance, method) {
        const agent = this.proxyMethod(instance, method);
        return (...args) => agent.call(instance, ...args, this.SYSTEM_CALL_MARKER);
    }
    proxyMethod(instance, method) {
        var _a;
        const agent = instance[method];
        const ctor = (_a = Object.getPrototypeOf(instance)) === null || _a === void 0 ? void 0 : _a.constructor;
        if (!ctor || typeof agent !== 'function')
            return agent;
        const annotations = Reflector.resolveParameterAnnotations(ctor, method);
        if (!annotations || !annotations.length)
            return agent.bind(instance);
        const nativeStore = ctor[NATIVE_METHOD] || {};
        const targetMethod = nativeStore[method] || agent;
        const proxy = this.createProxy(instance, method, targetMethod, annotations);
        if (nativeStore[method]) {
            nativeStore[method] = proxy;
            return agent;
        }
        return proxy;
    }
    createProxy(instance, method, nativeMethod, annotations) {
        if (nativeMethod[IS_PROXY])
            return nativeMethod;
        const wrapper = {
            [method]: function (...args) {
                const lastArg = args.length > 0 ? args[args.length - 1] : undefined;
                const isSystemCall = lastArg === SYSTEM_CALL_MARKER;
                if (isSystemCall) {
                    const realArgs = args.slice(0, -1);
                    return nativeMethod.apply(instance, resolveParams(annotations, realArgs));
                }
                return nativeMethod.apply(instance, args);
            }
        };
        const proxy = wrapper[method];
        Object.defineProperty(proxy, IS_PROXY, {
            value: true,
            writable: false,
            enumerable: false,
            configurable: true
        });
        return proxy;
    }
};
MethodProxy = __decorate([
    Injectable()
], MethodProxy);
export { MethodProxy };