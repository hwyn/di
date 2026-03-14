import { AnnotationMeta, PropMetadataMap, ResolveMode, TokenKey } from '../metadata';
export type DepMeta = TokenKey | AnnotationMeta[];
export declare function resolveParams(deps: DepMeta[], args?: readonly unknown[], mode?: ResolveMode): unknown[];
/**
 * Resolves DI annotations on an object's properties and injects the resolved values.
 *
 * Iterates over every property in `props` (a {@link PropMetadataMap} produced by
 * `Reflector.resolveProperties()`), resolves each property's dependency definition
 * through the current injection context, and assigns the result back onto `target`.
 *
 * In `ResolveMode.Async` mode, all property resolutions run concurrently and the
 * function returns a `Promise<T>` that settles when every property has been injected.
 *
 * @typeParam T - The type of the target object.
 * @param target - The object whose properties will be injected.
 * @param props - Map of property names to their decorator annotation metadata arrays.
 * @param mode - Resolution mode (`Sync` or `Async`). Defaults to `Sync`.
 * @returns The same `target` (sync) or a `Promise<T>` resolving to `target` (async).
 */
export declare function resolveProps<T extends object>(target: T, props: PropMetadataMap, mode?: ResolveMode): T | Promise<T>;
