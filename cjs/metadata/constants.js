"use strict";
/**
 * @file meta/constants.ts
 * @description Defines global constants and flags used in the Dependency Injection system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_ARRAY = exports.NO_VALUE = exports.DecoratorFlags = exports.IGNORE_SCOPE = exports.ROOT_SCOPE = void 0;
exports.ROOT_SCOPE = 'root';
exports.IGNORE_SCOPE = Symbol('IGNORE_SCOPE');
var DecoratorFlags;
(function (DecoratorFlags) {
    DecoratorFlags[DecoratorFlags["Inject"] = -1] = "Inject";
})(DecoratorFlags || (exports.DecoratorFlags = DecoratorFlags = {}));
exports.NO_VALUE = {};
exports.EMPTY_ARRAY = Object.freeze([]);
