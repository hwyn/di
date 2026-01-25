/**
 * @file core/injector.ts
 * @description Defines the abstract Injector class, which is the primary public API for dependency injection.
 */
import { ɵɵInject } from "./context.js";
import { INJECTOR } from "./tokens.js";
var Injector = /** @class */ (function () {
    function Injector() {
    }
    Injector.__prov_def__ = { token: Injector, factory: function () { return ɵɵInject(INJECTOR); } };
    Injector.create = function () {
        throw new Error('DI implementation not loaded.');
    };
    return Injector;
}());
export { Injector };
