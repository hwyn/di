/**
 * @file token-binding.ts
 * @description Provides @Token and @MultiToken decorators for simplified dependency binding.
 * This is an extension to the core DI system, leveraging `setInjectableDef` for metadata registration.
 * Note: Cyclic dependencies in the bound classes are handled by the core DI's `forwardRef` support (via `ɵɵInject`).
 * The `deps` resolution in `MultiToken` is lazy, ensuring all classes are registered before factory execution.
 */
import { InjectorToken, Type } from '../metadata';
export declare function Token(token: InjectorToken, scope?: string): (target: Type<any>) => void;
export declare function MultiToken(token: InjectorToken, scope?: string): (target: Type<any>) => void;
