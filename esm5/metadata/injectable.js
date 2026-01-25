/**
 * @file meta/injectable.ts
 * @description Defines the @Injectable and @Inject decorators and relevant configuration options.
 */
import { __assign } from "tslib";
import { DecoratorFlags, ROOT_SCOPE } from "./constants.js";
import { makeDecorator, makeParamDecorator, markInject } from "./decorators.js";
import { setInjectableDef as _setInjectableDef } from "./metadata-keys.js";
export var setInjectableDef = function (type, opt) {
    var _a = (opt || {}).providedIn, providedIn = _a === void 0 ? ROOT_SCOPE : _a;
    var def = { token: type, providedIn: providedIn, opt: opt };
    return _setInjectableDef(type, def);
};
export var Injectable = makeDecorator('Injectable', function (opt) { return opt; }, setInjectableDef);
var resolveToken = function (token, opt) { return (__assign(__assign({}, opt), { token: token })); };
export var Inject = markInject(makeParamDecorator('Inject', resolveToken), DecoratorFlags.Inject);
export var Optional = markInject(makeParamDecorator('Optional'), 1 /* InjectFlags.Optional */);
export var Self = markInject(makeParamDecorator('Self'), 2 /* InjectFlags.Self */);
export var SkipSelf = markInject(makeParamDecorator('SkipSelf'), 4 /* InjectFlags.SkipSelf */);
