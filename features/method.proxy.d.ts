/**
 * Service that creates DI-aware proxies for class methods.
 *
 * When a method has parameter-level DI annotations (e.g. `@Inject`, `@Optional`),
 * `MethodProxy` wraps the method so that annotated parameters are auto-resolved
 * from the injection context at call-time.
 *
 * Used internally by the framework to power method-level parameter injection and
 * similar patterns where method parameters need runtime DI resolution.
 *
 * @example
 * ```ts
 * const proxy = injector.get(MethodProxy);
 * const invoker = proxy.createSystemInvoker(serviceInstance, 'execute');
 * // calling invoker() auto-resolves DI params and passes a system-call marker
 * const result = invoker('arg1', 'arg2');
 * ```
 */
export declare class MethodProxy {
    readonly SYSTEM_CALL_MARKER: symbol;
    createSystemInvoker(instance: any, method: string): (...args: any[]) => any;
    proxyMethod<T extends object, K extends keyof T>(instance: T, method: K): T[K];
    proxyMethod(instance: any, method: string): any;
    private createProxy;
}
