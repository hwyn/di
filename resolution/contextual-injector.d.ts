import { Injector } from '../registry';
import { TokenKey, Provider } from '../metadata';
import { StaticInjector } from './static-injector';
export declare class ContextualInjector implements Injector {
    private parent;
    private stack;
    get destroyed(): boolean;
    get interceptStrategy(): (instance: unknown, token: TokenKey) => unknown;
    constructor(parent: StaticInjector, stack: Set<TokenKey>);
    get<T = unknown>(token: TokenKey, flags?: number): T;
    getAsync<T = unknown>(token: TokenKey, flags?: number): Promise<T>;
    set(token: TokenKey, provider: Provider): void;
    destroy(): void;
}
