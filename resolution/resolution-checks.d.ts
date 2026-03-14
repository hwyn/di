import { InjectorRecord } from '../registry';
import { TokenKey } from '../metadata';
export declare function validateSkipSelf(flags: number): void;
export declare function checkNoProvider<T>(token: TokenKey, flags: number): T | null;
export declare function checkSelfAndOptional<T>(token: TokenKey, flags: number, record: T | null | undefined): T | null | undefined;
export declare function validateResolution<T>(token: TokenKey, record: InjectorRecord<unknown> | null | undefined, flags: number): void;
