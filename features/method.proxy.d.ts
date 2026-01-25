/**
 * @file features/method.proxy.ts
 * @description Experimental feature for AOP-style method interception and proxying.
 */
export declare class MethodProxy {
    private injector;
    proxyMethod<T extends object, K extends keyof T>(instance: T, method: K): T[K];
    proxyMethod(instance: any, method: string): any;
    private createProxy;
}
