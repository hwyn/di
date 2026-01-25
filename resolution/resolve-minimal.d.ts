/**
 * @file impl/resolve-minimal.ts
 * @description Provides a lightweight, standalone resolution mechanism (useful for testing or simple scopes).
 */
import { Injector } from '../registry';
import { TokenKey, Type } from '../metadata';
export declare function resolveMinimal<T>(token: Type<T> | TokenKey, parent?: Injector): [T, () => void | Promise<void>];
export declare function resolveMinimalAsync<T>(token: Type<T> | TokenKey, parent?: Injector): Promise<[T, () => Promise<void>]>;
