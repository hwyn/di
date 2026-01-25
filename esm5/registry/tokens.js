/**
 * @file registry/tokens.ts
 * @description Defines InjectionTokens used within the Registry/Resolution layers.
 */
import { InjectorToken } from "../metadata/index.js";
export var INJECTOR = InjectorToken.get('INJECTOR');
export var INJECTOR_SCOPE = InjectorToken.get('INJECTOR_SCOPE');
export var INTERCEPTORS = InjectorToken.get('INTERCEPTORS');
