import { __decorate } from "tslib";
import { resolveParams } from "../resolution/index.js";
import { Injectable, IS_PROXY, NATIVE_METHOD, Reflector } from "../metadata/index.js";
const SYSTEM_CALL_MARKER = Symbol('__DI_SYS_CALL__');
/**
 * Service that creates DI-aware proxies for class methods.
 *
 * When a method has parameter-level DI annotations (e.g. `@Inject`, `@Optional`),
 * `MethodProxy` wraps the method so that annotated parameters are auto-resolved
 * from the injection context at call-time.
 *
 * Used internally by the framework to power method-level parameter injection and
 * similar patterns where method parameters need runtime DI resolution.
 *
 * @example
 * ```ts
 * const proxy = injector.get(MethodProxy);
 * const invoker = proxy.createSystemInvoker(serviceInstance, 'execute');
 * // calling invoker() auto-resolves DI params and passes a system-call marker
 * const result = invoker('arg1', 'arg2');
 * ```
 */
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
        if (agent[IS_PROXY])
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