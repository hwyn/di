/**
 * @file meta/constants.ts
 * @description Defines global constants and flags used in the Dependency Injection system.
 */
export declare const enum InjectFlags {
    Default = 0,
    Optional = 1,
    Self = 2,
    SkipSelf = 4,
    AllowAsync = 65536
}
export declare enum ResolveMode {
    Sync = 0,
    Async = 1
}
export declare const enum RecordFlags {
    None = 0,
    MaskFromChild = 134217728,
    Private = 268435456,
    MaskHasProxy = 536870912,
    MaskInstantiating = 1073741824
}
export declare const ROOT_SCOPE = "root";
export declare const IGNORE_SCOPE: unique symbol;
export declare enum DecoratorFlags {
    Inject = -1,
    Pipeline = -2
}
export declare const NO_VALUE: {};
export declare const EMPTY_ARRAY: readonly any[];
