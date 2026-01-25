/**
 * @file meta/constants.ts
 * @description Defines global constants and flags used in the Dependency Injection system.
 */
export const ROOT_SCOPE = 'root';
export const IGNORE_SCOPE = Symbol('IGNORE_SCOPE');
export var DecoratorFlags;
(function (DecoratorFlags) {
    DecoratorFlags[DecoratorFlags["Inject"] = -1] = "Inject";
})(DecoratorFlags || (DecoratorFlags = {}));
export const NO_VALUE = {};
export const EMPTY_ARRAY = Object.freeze([]);
