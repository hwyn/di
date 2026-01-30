/**
 * @file meta/constants.ts
 * @description Defines global constants and flags used in the Dependency Injection system.
 */
export var InjectFlags;
(function (InjectFlags) {
    InjectFlags[InjectFlags["Default"] = 0] = "Default";
    InjectFlags[InjectFlags["Optional"] = 1] = "Optional";
    InjectFlags[InjectFlags["Self"] = 2] = "Self";
    InjectFlags[InjectFlags["SkipSelf"] = 4] = "SkipSelf";
    InjectFlags[InjectFlags["AllowAsync"] = 65536] = "AllowAsync";
})(InjectFlags || (InjectFlags = {}));
export var ResolveMode;
(function (ResolveMode) {
    ResolveMode[ResolveMode["Sync"] = 0] = "Sync";
    ResolveMode[ResolveMode["Async"] = 1] = "Async";
})(ResolveMode || (ResolveMode = {}));
export var RecordFlags;
(function (RecordFlags) {
    RecordFlags[RecordFlags["None"] = 0] = "None";
    // Internal flags for provider lookup
    RecordFlags[RecordFlags["MaskFromChild"] = 134217728] = "MaskFromChild";
    // Internal flags for private provider handling
    RecordFlags[RecordFlags["Private"] = 268435456] = "Private";
    // Internal flags for cyclic dependency handling
    RecordFlags[RecordFlags["MaskHasProxy"] = 536870912] = "MaskHasProxy";
    RecordFlags[RecordFlags["MaskInstantiating"] = 1073741824] = "MaskInstantiating";
})(RecordFlags || (RecordFlags = {}));
export const ROOT_SCOPE = 'root';
export const IGNORE_SCOPE = Symbol('IGNORE_SCOPE');
export var DecoratorFlags;
(function (DecoratorFlags) {
    DecoratorFlags[DecoratorFlags["Inject"] = -1] = "Inject";
    DecoratorFlags[DecoratorFlags["Pipeline"] = -2] = "Pipeline";
})(DecoratorFlags || (DecoratorFlags = {}));
export const NO_VALUE = {};
export const EMPTY_ARRAY = Object.freeze([]);