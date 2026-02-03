"use strict";
/**
 * @file meta/injectable.ts
 * @description Defines the @Injectable and @Inject decorators and relevant configuration options.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipSelf = exports.Self = exports.Optional = exports.Inject = exports.Injectable = exports.setInjectableDef = void 0;
var tslib_1 = require("tslib");
var constants_1 = require("./constants");
var decorators_1 = require("./decorators");
var metadata_keys_1 = require("./metadata-keys");
var common_1 = require("../common");
var setInjectableDef = function (type, opt) {
    var _a = (opt || {}).scope, scope = _a === void 0 ? constants_1.ROOT_SCOPE : _a;
    var def = { token: type, scope: scope, opt: opt };
    if (common_1.InstantiationPolicy.activeEnv) {
        def.env = common_1.InstantiationPolicy.activeEnv;
    }
    return (0, metadata_keys_1.setInjectableDef)(type, def);
};
exports.setInjectableDef = setInjectableDef;
exports.Injectable = (0, decorators_1.makeDecorator)('Injectable', function (opt) { return opt; }, function (target, _a) {
    var args = _a.args;
    return exports.setInjectableDef.apply(void 0, tslib_1.__spreadArray([target], tslib_1.__read(args), false));
});
var resolveToken = function (token, opt) { return (tslib_1.__assign(tslib_1.__assign({}, opt), { token: token })); };
exports.Inject = (0, decorators_1.markInject)((0, decorators_1.makeParamDecorator)('Inject', resolveToken), constants_1.DecoratorFlags.Inject);
exports.Optional = (0, decorators_1.markInject)((0, decorators_1.makeParamDecorator)('Optional'), constants_1.InjectFlags.Optional);
exports.Self = (0, decorators_1.markInject)((0, decorators_1.makeParamDecorator)('Self'), constants_1.InjectFlags.Self);
exports.SkipSelf = (0, decorators_1.markInject)((0, decorators_1.makeParamDecorator)('SkipSelf'), constants_1.InjectFlags.SkipSelf);