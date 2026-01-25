/**
 * @file metadata/index.ts
 * @description Exports all metadata-related definitions (decorators, tokens, providers).
 */
export * from "./constants.js";
export * from "./decorators.js";
export * from "./injectable.js";
export { INJECTOR_PROV_DEF, getInjectableDef } from "./metadata-keys.js";
export * from "./provider.js";
export * from "./reflector.js";
export * from "./injector-token.js";
