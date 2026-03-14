import './reflect-polyfill';
import type { Annotation, AnnotationMeta, ParameterDependency, PropMetadataMap, Type } from './types';
export interface ResolvedMeta {
    props?: PropMetadataMap;
    params?: ParameterDependency[];
    methods?: Map<string, Annotation[]>;
    hasParamAnnotations?: boolean;
    hasPropAnnotations?: boolean;
    paramAnnotations?: Map<string, AnnotationMeta[][]>;
    propAnnotations?: Map<string, AnnotationMeta[]>;
}
/**
 * Metadata reflector that reads and caches decorator annotations from classes.
 *
 * `Reflector` resolves class-level, method-level, parameter-level, and property-level
 * annotations stored by the `make*Decorator` family. It walks the prototype chain to
 * merge metadata from parent classes, and aggressively caches results for performance.
 *
 * All methods are available both as instance methods (on the singleton) and as
 * static methods (proxied to the singleton). Use the generic parameter `T` on each
 * method to narrow the returned annotation type.
 *
 * @example
 * ```ts
 * // Get class-level annotation
 * const meta = Reflector.resolveClassAnnotation<InjectableMeta>(MyService, 'Injectable');
 *
 * // Get method annotations
 * const hooks = Reflector.resolveMethodAnnotations(MyService, 'onInit');
 *
 * // Get constructor dependencies
 * const deps = Reflector.resolveParameters(MyService);
 * ```
 */
export declare class Reflector {
    private _reflect;
    private _fallbackCache;
    private _getMeta;
    /**
     * Resolves all property-level metadata for a class, merged along the prototype chain.
     *
     * @typeParam T - The annotation metadata type (defaults to {@link AnnotationMeta}).
     * @param type - The class constructor to inspect.
     * @returns A map of property names to arrays of annotations.
     */
    static resolveProperties<T extends AnnotationMeta = AnnotationMeta>(type: Type): Record<string, T[]>;
    /**
     * Resolves constructor parameter dependencies, combining TypeScript `design:paramtypes`
     * with explicit parameter annotations (e.g. `@Inject`, `@Optional`).
     *
     * @param type - The class constructor to inspect.
     * @returns An array of {@link ParameterDependency} tuples (one per parameter).
     */
    static resolveParameters(type: Type): ParameterDependency[];
    /**
     * Resolves parameter annotations for a specific method (not the constructor).
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @param method - The method name.
     * @returns A 2D array: `result[paramIndex]` is an array of annotations for that parameter.
     */
    static resolveParameterAnnotations<T extends AnnotationMeta = AnnotationMeta>(type: Type, method: string): T[][];
    /**
     * Resolves a specific class-level annotation by its `metadataName`.
     *
     * @typeParam T - The expected annotation type (extends {@link Annotation}).
     * @param type - The class constructor to inspect.
     * @param annotationName - The `metadataName` to match (e.g. `'Injectable'`, `'Scope'`).
     * @returns The matching annotation, or `null` if not found.
     */
    static resolveClassAnnotation<T extends Annotation = Annotation>(type: Type, annotationName: string): T | null;
    /**
     * Resolves annotations applied to a specific method, optionally filtered by name.
     *
     * @typeParam T - The expected annotation type.
     * @param type - The class constructor.
     * @param methodName - The method name to inspect.
     * @param filterNames - Optional array of `metadataName` values to filter by.
     * @returns An array of matching annotations.
     */
    static resolveMethodAnnotations<T extends Annotation = Annotation>(type: Type, methodName: string, filterNames?: string[]): T[];
    /**
     * Resolves the TypeScript `design:type` metadata for a property.
     *
     * @typeParam T - The expected type reference.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns The design-time type constructor (e.g. `String`, `Number`, a class).
     */
    static resolvePropertyType<T = unknown>(type: Type, propertyName: string): T;
    /**
     * Resolves custom annotations for a specific property.
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns An array of annotations applied to the property.
     */
    static resolvePropertyAnnotations<T extends AnnotationMeta = AnnotationMeta>(type: Type, propertyName: string): T[];
    /**
     * Checks whether a class (or any ancestor) has property-level metadata.
     *
     * Use this as a fast gate before calling `resolveProperties()` to avoid
     * unnecessary prototype-chain traversal.
     *
     * @param type - The class constructor.
     * @returns `true` if any property metadata exists.
     */
    static hasPropMetadata(type: Type): boolean;
    private _checkHasPropMetadata;
    private _collectPropMetadata;
    /**
     * Resolves all property metadata for a type, merging along the prototype chain.
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @returns A map of property names to arrays of annotations.
     */
    resolveProperties<T extends AnnotationMeta = AnnotationMeta>(type: Type): Record<string, T[]>;
    hasPropMetadata(type: Type): boolean;
    /**
     * Resolves constructor (or method) parameter dependencies.
     *
     * Combines `design:paramtypes` with explicit parameter annotations into
     * a {@link ParameterDependency} array. Results for `constructor` are cached.
     *
     * @param type - The class constructor.
     * @param methodName - The method name (default: `'constructor'`).
     * @returns An array of {@link ParameterDependency} tuples.
     */
    resolveParameters(type: Type, methodName?: string): ParameterDependency[];
    /**
     * Resolves a specific class-level annotation by its `metadataName`, or returns `null`.
     *
     * @typeParam T - The expected annotation type.
     * @param type - The class constructor.
     * @param annotationName - The metadata name to match.
     * @returns The annotation or `null`.
     */
    resolveClassAnnotation<T extends Annotation = Annotation>(type: Type, annotationName: string): T | null;
    /**
     * Resolves parameter annotations for a method.
     *
     * On first access, eagerly resolves and caches annotations for ALL methods on the class.
     * Subsequent calls for different methods are O(1) cache lookups.
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @param methodName - The method name.
     * @returns A 2D array: `result[paramIndex]` contains annotations for that parameter.
     */
    resolveParameterAnnotations<T extends AnnotationMeta = AnnotationMeta>(type: Type, methodName: string): T[][];
    /**
     * Resolves annotations applied to a method, optionally filtered by annotation name.
     *
     * @typeParam T - The expected annotation type.
     * @param type - The class constructor.
     * @param methodName - The method name.
     * @param filterNames - Optional list of `metadataName` values to include.
     * @returns An array of matching annotations.
     */
    resolveMethodAnnotations<T extends Annotation = Annotation>(type: Type, methodName: string, filterNames?: string[]): T[];
    /**
     * Resolves the TypeScript `design:type` metadata for a property.
     *
     * @typeParam T - The expected type.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns The design-time type constructor.
     */
    resolvePropertyType<T = unknown>(type: Type, propertyName: string): T;
    /**
     * Resolves custom annotations for a property (own metadata only, eagerly cached).
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns An array of annotations.
     */
    resolvePropertyAnnotations<T extends AnnotationMeta = AnnotationMeta>(type: Type, propertyName: string): T[];
    private getOwnMetadata;
    private getParentCtor;
}
