import { Provider, TokenKey, Type } from './type-api';
export declare abstract class Injector {
    readonly destroyed: boolean;
    abstract get<T = any>(token: Type<T> | TokenKey, ...params: any[]): T;
    abstract set(token: any, provider: Provider): void;
    abstract destroy(): void;
    static __prov_def__: {
        token: typeof Injector;
        providedIn: string;
        factory: () => any;
    };
    static create: (providers?: Provider[] | null, parent?: Injector) => import("./injector").StaticInjector;
}
