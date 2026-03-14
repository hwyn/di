export const INJECTOR_PROV_DEF = '__prov_def__';
export const MODULE_INJ_DEF = '__inj_def__';
function factoryGetDef(def) {
    return (type) => type && type.hasOwnProperty(def) ? type[def] : null;
}
function factorySetDef(def) {
    return (type, value) => Object.defineProperty(type, def, { value });
}
export const getInjectorDef = factoryGetDef(MODULE_INJ_DEF);
export const setInjectorDef = factorySetDef(MODULE_INJ_DEF);
/** Retrieves the Injectable definition for a token, or null if not registered. */
export const getInjectableDef = factoryGetDef(INJECTOR_PROV_DEF);
export const setInjectableDef = factorySetDef(INJECTOR_PROV_DEF);