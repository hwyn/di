"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Injector = void 0;
var context_1 = require("./context");
var tokens_1 = require("./tokens");
/**
 * The dependency injection container.
 *
 * An `Injector` is the central unit of the DI system. It holds provider registrations,
 * creates and caches instances, and manages their lifecycle (including disposal).
 *
 * Injectors form a hierarchy: if a token is not found in the current injector,
 * resolution delegates to the parent injector. This enables scoped services
 * (e.g. request-scoped, module-scoped).
 *
 * Create injectors with `Injector.create(providers, parent)`. In most applications,
 * injectors are created by the framework's bootstrap process.
 *
 * @example
 * ```ts
 * const injector = Injector.create([
 *   MyService,
 *   { provide: Logger, useClass: ConsoleLogger },
 *   { provide: API_URL, useValue: '/api' },
 * ]);
 *
 * const service = injector.get(MyService);
 * ```
 */
var Injector = /** @class */ (function () {
    function Injector() {
    }
    Injector.__prov_def__ = { token: Injector, factory: function () { return (0, context_1.ɵɵInject)(tokens_1.INJECTOR); } };
    /**
     * Creates a new Injector instance with the given providers and optional parent.
     *
     * The parent injector is used for fallback resolution: tokens not found in the
     * new injector will be looked up in the parent chain.
     *
     * @param providers - Array of provider definitions to register.
     * @param parent - Optional parent injector for hierarchical resolution.
     * @returns A new Injector instance.
     *
     * @example
     * ```ts
     * const root = Injector.create([GlobalService]);
     * const child = Injector.create([RequestService], root);
     * ```
     */
    Injector.create = function () {
        throw new Error('DI implementation not loaded.');
    };
    return Injector;
}());
exports.Injector = Injector;