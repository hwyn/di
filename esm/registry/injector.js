/**
 * @file core/injector.ts
 * @description Defines the abstract Injector class, which is the primary public API for dependency injection.
 */
import { ɵɵInject } from "./context.js";
import { INJECTOR } from "./tokens.js";
export class Injector {
}
Injector.__prov_def__ = { token: Injector, factory: () => ɵɵInject(INJECTOR) };
Injector.create = () => {
    throw new Error('DI implementation not loaded.');
};