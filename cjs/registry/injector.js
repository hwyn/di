"use strict";
/**
 * @file core/injector.ts
 * @description Defines the abstract Injector class, which is the primary public API for dependency injection.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Injector = void 0;
var context_1 = require("./context");
var tokens_1 = require("./tokens");
var Injector = /** @class */ (function () {
    function Injector() {
    }
    Injector.__prov_def__ = { token: Injector, factory: function () { return (0, context_1.ɵɵInject)(tokens_1.INJECTOR); } };
    Injector.create = function () {
        throw new Error('DI implementation not loaded.');
    };
    return Injector;
}());
exports.Injector = Injector;
