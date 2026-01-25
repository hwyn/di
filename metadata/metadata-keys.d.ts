/**
 * @file meta/metadata_keys.ts
 * @description Accessor functions for setting and retrieving DI metadata on objects.
 */
export declare const INJECTOR_PROV_DEF = "__prov_def__";
export declare const MODULE_INJ_DEF = "__inj_def__";
export declare const getInjectorDef: (type: any) => any;
export declare const setInjectorDef: (type: any, value: any) => any;
export declare const getInjectableDef: (type: any) => any;
export declare const setInjectableDef: (type: any, value: any) => any;
