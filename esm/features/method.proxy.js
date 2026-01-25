/**
 * @file features/method.proxy.ts
 * @description Experimental feature for AOP-style method interception and proxying.
 */
import { __decorate, __metadata } from "tslib";
import { Injector, runInInjectionContext } from "../registry/index.js";
import { resolveParams, StaticInjector } from "../resolution/index.js";
import { Inject, Injectable, IS_PROXY, NATIVE_METHOD, Reflector } from "../metadata/index.js";
let MethodProxy = class MethodProxy {
    proxyMethod(instance, method) {
        var _a;
        const agent = instance[method];
        const ctor = (_a = Object.getPrototypeOf(instance)) === null || _a === void 0 ? void 0 : _a.constructor;
        if (!ctor || typeof agent !== 'function')
            return agent;
        const nativeStore = ctor[NATIVE_METHOD] || {};
        const targetMethod = nativeStore[method] || agent;
        const proxy = this.createProxy(instance, method, targetMethod);
        if (nativeStore[method]) {
            nativeStore[method] = proxy;
            return agent;
        }
        return proxy;
    }
    createProxy(instance, method, nativeMethod) {
        if (nativeMethod[IS_PROXY])
            return nativeMethod;
        const injector = this.injector;
        let annotations = null;
        const wrapper = {
            [method]: function (...args) {
                if (!annotations) {
                    const ctor = Object.getPrototypeOf(instance).constructor;
                    annotations = Reflector.resolveParameterAnnotations(ctor, method) || [];
                }
                if (!annotations.length)
                    return nativeMethod.apply(instance, args);
                return runInInjectionContext(injector, () => {
                    return nativeMethod.apply(instance, resolveParams(annotations, [...args]));
                });
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
__decorate([
    Inject(Injector),
    __metadata("design:type", StaticInjector)
], MethodProxy.prototype, "injector", void 0);
MethodProxy = __decorate([
    Injectable()
], MethodProxy);
export { MethodProxy };
