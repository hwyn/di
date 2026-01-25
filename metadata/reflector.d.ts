/**
 * @file meta/reflector.ts
 * @description Provides a mechanism to read metadata (annotations) from types and caching logic.
 */
import 'reflect-metadata';
import { Type } from './provider';
export interface Annotation {
    metadataName: string;
    [key: string]: any;
}
export interface ResolvedMeta {
    props?: Record<string, any[]>;
    params?: any[];
    methods?: Map<string, any[]>;
    hasParamAnnotations?: boolean;
    hasPropAnnotations?: boolean;
    paramAnnotations?: Map<string, any[][]>;
    propAnnotations?: Map<string, any[]>;
}
export declare class Reflector {
    private _reflect;
    private _fallbackCache;
    private _getMeta;
    static resolveProperties(type: Type): Record<string, any[]>;
    static resolveParameters(type: Type): any[];
    static resolveParameterAnnotations(type: any, method: string): any[][];
    static resolveClassAnnotation<T = any>(type: Type, annotationName: string): T | null;
    static resolveMethodAnnotations(type: Type, methodName: string, filterNames?: string[]): any[];
    static resolvePropertyType(type: Type, propertyName: string): any;
    static resolvePropertyAnnotations(type: Type, propertyName: string): any[];
    static hasPropMetadata(type: Type): boolean;
    /**
     * 内部通用扫描方法，支持两种模式：
     * 1. 仅检查存在性 (checkExistenceOnly=true)：发现属性元数据即返回 true，否则 false。
     * 2. 完整解析 (checkExistenceOnly=false)：收集并缓存所有属性元数据，返回 Record 对象。
     */
    private _scanForPropMetadata;
    /**
     * 解析指定类型的所有属性元数据，包括继承的属性。
     * 会合并原型链上的元数据。
     *
     * @param type 要解析属性的类类型。
     * @returns 一个记录对象，键是属性名，值是注解实例数组。
     */
    resolveProperties(type: Type): Record<string, any[]>;
    hasPropMetadata(type: Type): boolean;
    /**
     * 解析指定类型的构造函数参数。
     * 结合了设计类型（TypeScript 发射的类型）和显式的参数注解。
     * 优先使用已存在的缓存 (`meta.params`)，否则结合 `resolveParameterAnnotations` 与 `design:paramtypes` 生成并缓存。
     *
     * @param type 要解析参数的类类型。
     * @param methodName 方法名（默认为 'constructor'）。
     * @returns 一个数组，每个元素代表一个参数的依赖（类型或注解）。
     */
    resolveParameters(type: Type, methodName?: string): any[];
    /**
     * 解析特定的类级别注解。
     *
     * @param type 类类型。
     * @param annotationName 要查找的注解名称。
     * @returns 注解实例，如果未找到则返回 null。
     */
    resolveClassAnnotation<T = any>(type: Type, annotationName: string): T | null;
    /**
     * 解析指定方法的参数注解。
     * 采用“预分组 (Eager Grouping)”策略：在首次请求时，会一次性扫描该类所有方法的参数注解并建立缓存。
     * 后续对同类中任意方法的查询均为 O(1) 复杂度。
     *
     * @param type 类类型。
     * @param methodName 方法名。
     * @returns 注解数组的数组（每个参数对应一个数组，稀疏数组用 null 填充）。
     */
    resolveParameterAnnotations(type: Type, methodName: string): any[][];
    /**
     * 解析指定方法的注解，可根据注解名称过滤。
     * 使用按需缓存策略 (`meta.methods`)。
     *
     * @param type 类类型。
     * @param methodName 方法名。
     * @param filterNames 可选的注解名称过滤列表。
     * @returns 匹配的注解实例数组。
     */
    resolveMethodAnnotations(type: Type, methodName: string, filterNames?: string[]): any[];
    /**
     * 解析属性的 TypeScript 设计类型。
     * 不要与自定义注解混淆。
     *
     * @param type 类类型。
     * @param propertyName 属性名。
     * @returns 设计类型（例如 String, Number 或自定义类）。
     */
    resolvePropertyType(type: Type, propertyName: string): any;
    /**
     * 解析给定类型上特定属性的自定义注解。
     * 不会遍历原型链（仅限自有元数据）。
     * 采用“预分组 (Eager Grouping)”策略：在首次请求时，一次性缓存该类所有属性的注解。
     *
     * @param type 类类型。
     * @param propertyName 属性名。
     * @returns 注解实例数组。
     */
    resolvePropertyAnnotations(type: Type, propertyName: string): any[];
    private getOwnMetadata;
    private getParentCtor;
}
