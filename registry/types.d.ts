import { Provider, ResolveMode, TokenKey, AnnotationMeta } from '../metadata';
import { InstanceHookMetadata } from './hook-metadata';
import type { Injector } from './injector';
export interface RecordFactory<T = any> {
    (ctx?: Injector, mode?: ResolveMode): T;
    readonly name?: string;
    __type__?: TokenKey;
}
export interface InjectorBaseRecord<T> {
    factory: RecordFactory<T> | undefined;
    value: T | object;
    multi: Provider[] | undefined;
    flags?: number;
}
export interface InjectorRecord<T> extends InjectorBaseRecord<T> {
    provider?: Provider;
    resolving?: Promise<T>;
    metadata?: InstanceHookMetadata;
}
/**
 * Lifecycle interface for post-construction initialization.
 *
 * If a class implements `OnInit`, the injector calls `onInit()` after the instance
 * is created and all dependencies are injected. If `onInit()` returns a Promise,
 * it must be resolved via `getAsync()` — a sync `get()` in strict mode throws.
 *
 * @example
 * ```ts
 * @Injectable()
 * class AppCache implements OnInit {
 *   async onInit() {
 *     await this.warmUp();
 *   }
 * }
 * ```
 */
export interface OnInit {
    onInit(): void | Promise<void>;
}
/**
 * Lifecycle interface for cleanup before disposal.
 *
 * Called by `injector.destroy()` for every cached instance that implements this interface.
 * Return a Promise for async teardown (e.g. releasing resources).
 *
 * @example
 * ```ts
 * @Injectable()
 * class ResourceManager implements OnDestroy {
 *   async destroy() {
 *     await this.release();
 *   }
 * }
 * ```
 */
export interface OnDestroy {
    destroy(): void | Promise<void>;
}
/**
 * An interceptor function invoked after instance creation.
 *
 * Registered via the `INTERCEPTORS` token. Each interceptor receives the newly
 * created instance, its token, and the owning injector. Interceptors can mutate
 * or wrap the instance (e.g. for AOP proxies).
 */
export type InterceptorFn = (instance: unknown, token: TokenKey, injector: Injector) => unknown;
export interface InternalInjector extends Injector {
    interceptStrategy?: ((instance: unknown, token: TokenKey) => unknown) | null;
}
/**
 * Context object passed to pipeline value transformers.
 *
 * Decorators created with `DecoratorFlags.Pipeline` mark parameters that need
 * value transformation at resolution time. A `TransformPipe` implementing
 * `transform(ctx: TransformContext)` receives this context to produce the final value.
 *
 * @example
 * ```ts
 * class UpperCase implements PipeTransform {
 *   transform(ctx: TransformContext): unknown {
 *     return typeof ctx.value === 'string' ? ctx.value.toUpperCase() : ctx.value;
 *   }
 * }
 * ```
 */
export interface TransformContext {
    /** Whether the current resolution is synchronous or asynchronous. */
    mode: ResolveMode;
    /** The resolved value before this transform is applied. */
    value: unknown;
    /** The decorator annotation metadata (e.g. the options passed to `@Inject`). */
    meta: AnnotationMeta;
    /** The target object that owns the property/parameter being resolved. */
    target?: object;
    /** The property key or parameter index being resolved. */
    key: string | number;
    /** The parameter index (for parameter injection). */
    index?: number;
    /** Extra arguments from method invocation (for method-proxied parameters). */
    args?: readonly unknown[];
    /** The injector performing the resolution. */
    injector: Injector;
}
