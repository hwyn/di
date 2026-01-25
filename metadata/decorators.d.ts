/**
 * @file meta/decorators.ts
 * @description Defines the core decorator factories for creating annotations (like @Injectable, @Inject).
 */
import { TokenKey, Type } from './provider';
export declare const ANNOTATIONS = "__annotations__";
export declare const PARAMETERS = "__parameters__";
export declare const METHODS = "__methods__";
export declare const NATIVE_METHOD = "__native__method__";
export declare const PROP_METADATA = "__prop__metadata__";
export declare const RESOLVED_META: unique symbol;
export declare const IS_PROXY: unique symbol;
export declare const FORWARD_REF = "__forward__ref__";
export declare const DI_DECORATOR_FLAG = "__DI_FLAG__";
export type ClassDecorator<N> = <T extends Function>(target: T) => T | void;
export type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
export type TargetDecorator = ParameterDecorator & PropertyDecorator;
export type MetadataTypeFn = (type: Type, ...args: any[]) => void;
export type MetadataProps<M extends any[]> = (...args: M) => any;
export type MetadataFactoryAdapter<M> = (instance: any, args: M, target: any, key?: string | symbol, descriptor?: PropertyDescriptor | number) => void;
export declare function makeDecorator<M extends any[] = [], T = any>(name: string, props?: MetadataProps<M>, typeFn?: MetadataTypeFn): (...args: M) => ClassDecorator<T>;
export declare function makeParamDecorator<M extends any[] = []>(name: string, props?: MetadataProps<M>, typeFn?: MetadataTypeFn): (...args: M) => TargetDecorator;
export declare function makeMethodDecorator<M extends any[] = []>(name: string, props?: MetadataProps<M>, typeFn?: MetadataTypeFn): (...args: M) => MethodDecorator;
export declare const makePropDecorator: typeof makeParamDecorator;
export declare function markInject<T>(target: T, flag: number): T;
export declare function getInjectFlag<T = number>(token: any): T | undefined;
export declare function forwardRef(fn: () => TokenKey): () => TokenKey;
