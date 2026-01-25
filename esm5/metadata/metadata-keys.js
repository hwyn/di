/**
 * @file meta/metadata_keys.ts
 * @description Accessor functions for setting and retrieving DI metadata on objects.
 */
export var INJECTOR_PROV_DEF = '__prov_def__';
export var MODULE_INJ_DEF = '__inj_def__';
function factoryGetDef(def) {
    // eslint-disable-next-line no-prototype-builtins
    return function (type) { return type && type.hasOwnProperty(def) ? type[def] : null; };
}
function factorySetDef(def) {
    return function (type, value) { return Object.defineProperty(type, def, { value: value }); };
}
export var getInjectorDef = factoryGetDef(MODULE_INJ_DEF);
export var setInjectorDef = factorySetDef(MODULE_INJ_DEF);
export var getInjectableDef = factoryGetDef(INJECTOR_PROV_DEF);
export var setInjectableDef = factorySetDef(INJECTOR_PROV_DEF);
