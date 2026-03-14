export { Injector, TokenRegistry, INJECTOR, INJECTOR_SCOPE, INJECTOR_ENV, INTERCEPTORS, HookMetadata, runInInjectionContext, type TransformContext, type HookOptions, type OnInit, type OnDestroy, type InterceptorFn } from './registry';
export { resolveProps as propArgs } from './resolution';
export { DEBUG_MODE, InstantiationPolicy } from './common';
export { MethodProxy, Token, MultiToken, Scope, register } from './features';
export { deepProviders, resolveMinimal, resolveMinimalAsync, AsyncGovernance } from './resolution';
export { DecoratorFlags, forwardRef, getInjectableDef, Inject, Optional, Injectable, InjectFlags, IGNORE_SCOPE, InjectorToken, makeDecorator, makeMethodDecorator, makeParamDecorator, makePropDecorator, markInject, Reflector, Self, SkipSelf, ResolveMode, ROOT_SCOPE, setInjectableDef, } from './metadata';
export type { Annotation, ClassDecorator, Provider, TargetDecorator, TokenKey, Type, TypeClass, ForwardRefFn, ScopeId, InjectableOptions, } from './metadata';
