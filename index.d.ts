/**
 * @file index.ts
 * @description Public API for the Dependency Injection system.
 */
export { Injector, TokenRegistry, INJECTOR, INJECTOR_SCOPE, INTERCEPTORS, HookMetadata, runInInjectionContext } from './registry';
export { resolveProps as propArgs } from './resolution';
export { DEBUG_MODE, InstantiationPolicy } from './common';
export { MethodProxy, Token, MultiToken, Scope } from './features';
export { deepProviders, resolveMinimal, resolveMinimalAsync, AsyncGovernance } from './resolution';
export { DecoratorFlags, forwardRef, getInjectableDef, Inject, Optional, Injectable, InjectFlags, IGNORE_SCOPE, InjectorToken, makeDecorator, makeMethodDecorator, makeParamDecorator, makePropDecorator, markInject, Reflector, ROOT_SCOPE, setInjectableDef, } from './metadata';
export type { Provider, TokenKey, Type, TypeClass } from './metadata';
