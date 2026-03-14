"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERCEPTORS = exports.INJECTOR_ENV = exports.INJECTOR_SCOPE = exports.INJECTOR = void 0;
var metadata_1 = require("../metadata");
/**
 * Built-in token that resolves to the current `Injector` instance.
 *
 * In most cases you can inject the `Injector` class directly (`Injector` already has
 * a built-in `__prov_def__`). This token is mainly useful for programmatic resolution
 * in non-decorator scenarios.
 *
 * @example
 * ```ts
 * // Inject via class reference (recommended)
 * @Inject(Injector) private injector!: Injector;
 *
 * // Programmatic resolution
 * const injector = parentInjector.get(INJECTOR);
 * ```
 */
exports.INJECTOR = metadata_1.InjectorToken.get('INJECTOR');
/**
 * Built-in token that resolves to the scope identifier of the current injector.
 *
 * Returns values like `'root'`, `'request'`, or custom scope names.
 */
exports.INJECTOR_SCOPE = metadata_1.InjectorToken.get('INJECTOR_SCOPE');
/**
 * Built-in token that resolves to the environment identifier of the current injector.
 *
 * Environment tags enable conditional provider registration (e.g. `'test'`, `'production'`).
 */
exports.INJECTOR_ENV = metadata_1.InjectorToken.get('INJECTOR_ENV');
/**
 * Built-in multi-token for interceptor functions.
 *
 * Interceptors are invoked sequentially after each instance creation, allowing
 * cross-cutting concerns (logging, AOP, proxy wrapping) to be applied globally.
 *
 * @example
 * ```ts
 * Injector.create([
 *   { provide: INTERCEPTORS, useValue: (instance, token, injector) => {
 *     console.log(`Created: ${token}`);
 *     return instance;
 *   }}
 * ]);
 * ```
 */
exports.INTERCEPTORS = metadata_1.InjectorToken.get('INTERCEPTORS');