/**
 * @file resolution/resolution-checks.ts
 * @description Helpers for checking resolution constraints and flags.
 */
import { InjectorRecord } from '../registry';
import { TokenKey } from '../metadata';
export declare function validateSkipSelf(flags: number): void;
export declare function checkNoProvider(token: TokenKey, flags: number): any;
export declare function checkSelfAndOptional(token: TokenKey, flags: number, record: any): any;
export declare function validateResolution<T>(token: TokenKey, record: InjectorRecord<any> | null | undefined, flags: number): void;
