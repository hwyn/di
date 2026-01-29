/**
 * @file meta/injectable.ts
 * @description Defines the @Injectable and @Inject decorators and relevant configuration options.
 */
import { ProvidedInScope, Provider, TokenKey, Type } from './provider';
export type InjectableOptions<S = ProvidedInScope> = (Provider & {
    scope?: S;
}) | {
    scope?: S;
};
export declare const setInjectableDef: <S = ProvidedInScope>(type: Type, opt?: InjectableOptions<S>) => any;
export declare const Injectable: (opt?: InjectableOptions<ProvidedInScope>) => import("./decorators").ClassDecorator<any>;
export declare const Inject: (token: TokenKey, opt?: object) => import("./decorators").TargetDecorator;
export declare const Optional: () => import("./decorators").TargetDecorator;
export declare const Self: () => import("./decorators").TargetDecorator;
export declare const SkipSelf: () => import("./decorators").TargetDecorator;
