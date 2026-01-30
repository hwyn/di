/**
 * @file features/method.proxy.ts
 * @description Experimental feature for AOP-style method interception and proxying.
 */
export declare class MethodProxy {
    readonly SYSTEM_CALL_MARKER: symbol;
    createSystemInvoker(instance: any, method: string): (...args: any[]) => any;
    proxyMethod<T extends object, K extends keyof T>(instance: T, method: K): T[K];
    proxyMethod(instance: any, method: string): any;
    private createProxy;
}
