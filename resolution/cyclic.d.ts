/**
 * @file resolution/cyclic.ts
 * @description Logic for handling cyclic dependencies via Proxy interception.
 */
import { InjectorRecord } from '../registry';
/**
 * Wraps the instantiation process with safeguards against cyclic dependencies.
 * If a cycle is detected, it returns a Proxy instead of the real instance (for supported providers).
 */
export declare function guardCyclicDependency<T>(token: any, record: InjectorRecord<T>, next: () => T): T;
