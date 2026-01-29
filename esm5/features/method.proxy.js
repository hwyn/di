/**
 * @file features/method.proxy.ts
 * @description Experimental feature for AOP-style method interception and proxying.
 */
import { __decorate, __metadata, __read, __spreadArray } from "tslib";
import { Injector, runInInjectionContext } from "../registry/index.js";
import { resolveParams, StaticInjector } from "../resolution/index.js";
import { Inject, Injectable, IS_PROXY, NATIVE_METHOD, Reflector } from "../metadata/index.js";
var MethodProxy = /** @class */ (function () {
    function MethodProxy() {
    }
    MethodProxy.prototype.proxyMethod = function (instance, method) {
        var _a;
        var agent = instance[method];
        var ctor = (_a = Object.getPrototypeOf(instance)) === null || _a === void 0 ? void 0 : _a.constructor;
        if (!ctor || typeof agent !== 'function')
            return agent;
        var nativeStore = ctor[NATIVE_METHOD] || {};
        var targetMethod = nativeStore[method] || agent;
        var proxy = this.createProxy(instance, method, targetMethod);
        if (nativeStore[method]) {
            nativeStore[method] = proxy;
            return agent;
        }
        return proxy;
    };
    MethodProxy.prototype.createProxy = function (instance, method, nativeMethod) {
        var _a;
        if (nativeMethod[IS_PROXY])
            return nativeMethod;
        var injector = this.injector;
        var annotations = null;
        var wrapper = (_a = {},
            _a[method] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (!annotations) {
                    var ctor = Object.getPrototypeOf(instance).constructor;
                    annotations = Reflector.resolveParameterAnnotations(ctor, method) || [];
                }
                if (!annotations.length)
                    return nativeMethod.apply(instance, args);
                return runInInjectionContext(injector, function () {
                    return nativeMethod.apply(instance, resolveParams(annotations, __spreadArray([], __read(args), false)));
                });
            },
            _a);
        var proxy = wrapper[method];
        Object.defineProperty(proxy, IS_PROXY, {
            value: true,
            writable: false,
            enumerable: false,
            configurable: true
        });
        return proxy;
    };
    var _a;
    __decorate([
        Inject(Injector),
        __metadata("design:type", typeof (_a = typeof StaticInjector !== "undefined" && StaticInjector) === "function" ? _a : Object)
    ], MethodProxy.prototype, "injector", void 0);
    MethodProxy = __decorate([
        Injectable()
    ], MethodProxy);
    return MethodProxy;
}());
export { MethodProxy };