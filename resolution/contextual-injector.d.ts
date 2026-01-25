/**
 * @file resolution/contextual-injector.ts
 * @description A proxy injector used to propagate internal resolution state (like cycle detection stacks)
 * without exposing it to the public API or user factory functions.
 */
import { Injector } from '../registry';
import { StaticInjector } from './static-injector';
export declare class ContextualInjector implements Injector {
    private parent;
    private stack;
    get destroyed(): boolean;
    get interceptStrategy(): (instance: any, token: any) => any;
    constructor(parent: StaticInjector, stack: Set<any>);
    get<T = any>(token: any, flags?: number): T;
    getAsync<T = any>(token: any, flags?: number): Promise<T>;
    set(token: any, provider: any): void;
    destroy(): void;
}
