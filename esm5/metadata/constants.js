/**
 * @file meta/constants.ts
 * @description Defines global constants and flags used in the Dependency Injection system.
 */
export var ROOT_SCOPE = 'root';
export var IGNORE_SCOPE = Symbol('IGNORE_SCOPE');
export var DecoratorFlags;
(function (DecoratorFlags) {
    DecoratorFlags[DecoratorFlags["Inject"] = -1] = "Inject";
})(DecoratorFlags || (DecoratorFlags = {}));
export var NO_VALUE = {};
export var EMPTY_ARRAY = Object.freeze([]);
