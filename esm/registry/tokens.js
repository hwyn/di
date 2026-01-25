/**
 * @file registry/tokens.ts
 * @description Defines InjectionTokens used within the Registry/Resolution layers.
 */
import { InjectorToken } from "../metadata/index.js";
export const INJECTOR = InjectorToken.get('INJECTOR');
export const INJECTOR_SCOPE = InjectorToken.get('INJECTOR_SCOPE');
export const INTERCEPTORS = InjectorToken.get('INTERCEPTORS');
