/**
 * @file metadata/index.ts
 * @description Exports all metadata-related definitions (decorators, tokens, providers).
 */
export * from './constants';
export * from './decorators';
export * from './injectable';
export { INJECTOR_PROV_DEF, getInjectableDef } from './metadata-keys';
export * from './provider';
export * from './reflector';
export * from './injector-token';
