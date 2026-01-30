"use strict";
/**
 * @file features/method.proxy.ts
 * @description Experimental feature for AOP-style method interception and proxying.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodProxy = void 0;
var tslib_1 = require("tslib");
var resolution_1 = require("../resolution");
var metadata_1 = require("../metadata");
var SYSTEM_CALL_MARKER = Symbol('__DI_SYS_CALL__');
var MethodProxy = /** @class */ (function () {
    function MethodProxy() {
        this.SYSTEM_CALL_MARKER = SYSTEM_CALL_MARKER;
    }
    MethodProxy.prototype.createSystemInvoker = function (instance, method) {
        var _this = this;
        var agent = this.proxyMethod(instance, method);
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return agent.call.apply(agent, tslib_1.__spreadArray(tslib_1.__spreadArray([instance], tslib_1.__read(args), false), [_this.SYSTEM_CALL_MARKER], false));
        };
    };
    MethodProxy.prototype.proxyMethod = function (instance, method) {
        var _a;
        var agent = instance[method];
        var ctor = (_a = Object.getPrototypeOf(instance)) === null || _a === void 0 ? void 0 : _a.constructor;
        if (!ctor || typeof agent !== 'function')
            return agent;
        var annotations = metadata_1.Reflector.resolveParameterAnnotations(ctor, method);
        if (!annotations || !annotations.length)
            return agent.bind(instance);
        var nativeStore = ctor[metadata_1.NATIVE_METHOD] || {};
        var targetMethod = nativeStore[method] || agent;
        var proxy = this.createProxy(instance, method, targetMethod, annotations);
        if (nativeStore[method]) {
            nativeStore[method] = proxy;
            return agent;
        }
        return proxy;
    };
    MethodProxy.prototype.createProxy = function (instance, method, nativeMethod, annotations) {
        var _a;
        if (nativeMethod[metadata_1.IS_PROXY])
            return nativeMethod;
        var wrapper = (_a = {},
            _a[method] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var lastArg = args.length > 0 ? args[args.length - 1] : undefined;
                var isSystemCall = lastArg === SYSTEM_CALL_MARKER;
                if (isSystemCall) {
                    var realArgs = args.slice(0, -1);
                    return nativeMethod.apply(instance, (0, resolution_1.resolveParams)(annotations, realArgs));
                }
                return nativeMethod.apply(instance, args);
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
    MethodProxy = tslib_1.__decorate([
        (0, metadata_1.Injectable)()
    ], MethodProxy);
    return MethodProxy;
}());
exports.MethodProxy = MethodProxy;