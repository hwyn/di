"use strict";
/**
 * @file meta/metadata_keys.ts
 * @description Accessor functions for setting and retrieving DI metadata on objects.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setInjectableDef = exports.getInjectableDef = exports.setInjectorDef = exports.getInjectorDef = exports.MODULE_INJ_DEF = exports.INJECTOR_PROV_DEF = void 0;
exports.INJECTOR_PROV_DEF = '__prov_def__';
exports.MODULE_INJ_DEF = '__inj_def__';
function factoryGetDef(def) {
    // eslint-disable-next-line no-prototype-builtins
    return function (type) { return type && type.hasOwnProperty(def) ? type[def] : null; };
}
function factorySetDef(def) {
    return function (type, value) { return Object.defineProperty(type, def, { value: value }); };
}
exports.getInjectorDef = factoryGetDef(exports.MODULE_INJ_DEF);
exports.setInjectorDef = factorySetDef(exports.MODULE_INJ_DEF);
exports.getInjectableDef = factoryGetDef(exports.INJECTOR_PROV_DEF);
exports.setInjectableDef = factorySetDef(exports.INJECTOR_PROV_DEF);
