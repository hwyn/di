"use strict";
/**
 * @file features/method.proxy.ts
 * @description Experimental feature for AOP-style method interception and proxying.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodProxy = void 0;
var tslib_1 = require("tslib");
var registry_1 = require("../registry");
var resolution_1 = require("../resolution");
var metadata_1 = require("../metadata");
var MethodProxy = /** @class */ (function () {
    function MethodProxy() {
    }
    MethodProxy.prototype.proxyMethod = function (instance, method) {
        var _a;
        var agent = instance[method];
        var ctor = (_a = Object.getPrototypeOf(instance)) === null || _a === void 0 ? void 0 : _a.constructor;
        if (!ctor || typeof agent !== 'function')
            return agent;
        var nativeStore = ctor[metadata_1.NATIVE_METHOD] || {};
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
        if (nativeMethod[metadata_1.IS_PROXY])
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
                    annotations = metadata_1.Reflector.resolveParameterAnnotations(ctor, method) || [];
                }
                if (!annotations.length)
                    return nativeMethod.apply(instance, args);
                return (0, registry_1.runInInjectionContext)(injector, function () {
                    return nativeMethod.apply(instance, (0, resolution_1.resolveParams)(annotations, tslib_1.__spreadArray([], tslib_1.__read(args), false)));
                });
            },
            _a);
        var proxy = wrapper[method];
        Object.defineProperty(proxy, metadata_1.IS_PROXY, {
            value: true,
            writable: false,
            enumerable: false,
            configurable: true
        });
        return proxy;
    };
    tslib_1.__decorate([
        (0, metadata_1.Inject)(registry_1.Injector),
        tslib_1.__metadata("design:type", resolution_1.StaticInjector)
    ], MethodProxy.prototype, "injector", void 0);
    MethodProxy = tslib_1.__decorate([
        (0, metadata_1.Injectable)()
    ], MethodProxy);
    return MethodProxy;
}());
exports.MethodProxy = MethodProxy;
