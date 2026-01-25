"use strict";
/**
 * @file registry/tokens.ts
 * @description Defines InjectionTokens used within the Registry/Resolution layers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERCEPTORS = exports.INJECTOR_SCOPE = exports.INJECTOR = void 0;
var metadata_1 = require("../metadata");
exports.INJECTOR = metadata_1.InjectorToken.get('INJECTOR');
exports.INJECTOR_SCOPE = metadata_1.InjectorToken.get('INJECTOR_SCOPE');
exports.INTERCEPTORS = metadata_1.InjectorToken.get('INTERCEPTORS');
