/**
 * @file meta/injectable.ts
 * @description Defines the @Injectable and @Inject decorators and relevant configuration options.
 */
import { __assign, __read, __spreadArray } from "tslib";
import { DecoratorFlags, InjectFlags, ROOT_SCOPE } from "./constants.js";
import { makeDecorator, makeParamDecorator, markInject } from "./decorators.js";
import { setInjectableDef as _setInjectableDef } from "./metadata-keys.js";
import { InstantiationPolicy } from "../common/index.js";
export var setInjectableDef = function (type, opt) {
    var _a = (opt || {}).scope, scope = _a === void 0 ? ROOT_SCOPE : _a;
    var def = { token: type, scope: scope, opt: opt };
    if (InstantiationPolicy.activeEnv) {
        def.env = InstantiationPolicy.activeEnv;
    }
    return _setInjectableDef(type, def);
};
export var Injectable = makeDecorator('Injectable', function (opt) { return opt; }, function (target, _a) {
    var args = _a.args;
    return setInjectableDef.apply(void 0, __spreadArray([target], __read(args), false));
});
var resolveToken = function (token, opt) { return (__assign(__assign({}, opt), { token: token })); };
export var Inject = markInject(makeParamDecorator('Inject', resolveToken), DecoratorFlags.Inject);
export var Optional = markInject(makeParamDecorator('Optional'), InjectFlags.Optional);
export var Self = markInject(makeParamDecorator('Self'), InjectFlags.Self);
export var SkipSelf = markInject(makeParamDecorator('SkipSelf'), InjectFlags.SkipSelf);