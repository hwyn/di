/**
 * @file index.ts
 * @description Public API for the Dependency Injection system.
 */
export { Injector, TokenRegistry, INJECTOR, INJECTOR_SCOPE, INJECTOR_ENV, INTERCEPTORS, HookMetadata, runInInjectionContext, type TransformContext } from './registry';
export { resolveProps as propArgs } from './resolution';
export { DEBUG_MODE, InstantiationPolicy } from './common';
export { MethodProxy, Token, MultiToken, Scope, register } from './features';
export { deepProviders, resolveMinimal, resolveMinimalAsync, AsyncGovernance } from './resolution';
export { DecoratorFlags, forwardRef, getInjectableDef, Inject, Optional, Injectable, InjectFlags, IGNORE_SCOPE, InjectorToken, makeDecorator, makeMethodDecorator, makeParamDecorator, makePropDecorator, markInject, Reflector, ResolveMode, ROOT_SCOPE, setInjectableDef, } from './metadata';
export type { Provider, TokenKey, Type, TypeClass } from './metadata';
