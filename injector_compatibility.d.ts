import { Injector } from './injector.abstract';
import { TokenKey } from './type-api';
export declare const enum DecoratorFlags {
    Inject = -1
}
export declare function saveCurrentInjector(_inject: Injector): Injector;
export declare function getCurrentInjector(): Injector;
export declare function attachInjectFlag<T>(decorator: T, flag: number): T;
export declare function getInjectFlag<T = number>(token: any): T | undefined;
export declare function forwardRef(ref: () => TokenKey): () => TokenKey;
export declare function ɵɵInject(token: any, flags?: any): any;
export declare function injectArgs(types: any[], ...args: any[]): any[];
export type TransformProp = (meta: any, value: any, type: any, prop: string) => any;
export declare function propArgs(type: any, propMetadata: any): any;
