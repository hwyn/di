/**
 * @file index.ts
 * @description Public API for the Dependency Injection system.
 */
export { Injector, TokenRegistry, INJECTOR, INJECTOR_SCOPE, INJECTOR_ENV, INTERCEPTORS, HookMetadata, runInInjectionContext } from "./registry/index.js";
export { resolveProps as propArgs } from "./resolution/index.js";
export { DEBUG_MODE, InstantiationPolicy } from "./common/index.js";
export { MethodProxy, Token, MultiToken, Scope, register } from "./features/index.js";
export { deepProviders, resolveMinimal, resolveMinimalAsync, AsyncGovernance } from "./resolution/index.js";
export { DecoratorFlags, forwardRef, getInjectableDef, Inject, Optional, Injectable, InjectFlags, IGNORE_SCOPE, InjectorToken, makeDecorator, makeMethodDecorator, makeParamDecorator, makePropDecorator, markInject, Reflector, ResolveMode, ROOT_SCOPE, setInjectableDef, } from "./metadata/index.js";