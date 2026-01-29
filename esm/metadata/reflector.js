/**
 * @file meta/reflector.ts
 * @description Provides a mechanism to read metadata (annotations) from types and caching logic.
 */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-prototype-builtins */
import 'reflect-metadata';
import { ANNOTATIONS, METHODS, PARAMETERS, PROP_METADATA, RESOLVED_META } from "./decorators.js";
const DESIGN_PROP_TYPE = 'design:type';
const DESIGN_PARAM_TYPES = 'design:paramtypes';
const EMPTY_ARRAY = Object.freeze([]);
export class Reflector {
    constructor() {
        this._reflect = typeof global === 'object' ? global.Reflect : typeof self === 'object' ? self.Reflect : Reflect;
        this._fallbackCache = new WeakMap();
    }
    _getMeta(type) {
        if (Object.prototype.hasOwnProperty.call(type, RESOLVED_META)) {
            return type[RESOLVED_META];
        }
        let meta = this._fallbackCache.get(type);
        if (meta)
            return meta;
        meta = {};
        try {
            if (Object.isExtensible(type)) {
                Object.defineProperty(type, RESOLVED_META, {
                    value: meta,
                    enumerable: false,
                    writable: true,
                    configurable: true
                });
                return meta;
            }
        }
        catch (e) {
            // ignore
        }
        this._fallbackCache.set(type, meta);
        return meta;
    }
    static resolveProperties(type) {
        return reflector.resolveProperties(type);
    }
    static resolveParameters(type) {
        return reflector.resolveParameters(type);
    }
    static resolveParameterAnnotations(type, method) {
        return reflector.resolveParameterAnnotations(type, method);
    }
    static resolveClassAnnotation(type, annotationName) {
        return reflector.resolveClassAnnotation(type, annotationName);
    }
    static resolveMethodAnnotations(type, methodName, filterNames) {
        return reflector.resolveMethodAnnotations(type, methodName, filterNames);
    }
    static resolvePropertyType(type, propertyName) {
        return reflector.resolvePropertyType(type, propertyName);
    }
    static resolvePropertyAnnotations(type, propertyName) {
        return reflector.resolvePropertyAnnotations(type, propertyName);
    }
    static hasPropMetadata(type) {
        return reflector.hasPropMetadata(type);
    }
    /**
     * 内部通用扫描方法，支持两种模式：
     * 1. 仅检查存在性 (checkExistenceOnly=true)：发现属性元数据即返回 true，否则 false。
     * 2. 完整解析 (checkExistenceOnly=false)：收集并缓存所有属性元数据，返回 Record 对象。
     */
    _scanForPropMetadata(type, checkExistenceOnly) {
        var _a;
        var _b;
        const meta = this._getMeta(type);
        // 1. Fast Path: Cache Hit
        if (meta.props) {
            return checkExistenceOnly ? Object.keys(meta.props).length > 0 : meta.props;
        }
        if (checkExistenceOnly && meta.hasPropAnnotations !== undefined) {
            return meta.hasPropAnnotations;
        }
        // 2. Traversal Logic
        const propMetadata = checkExistenceOnly ? null : {};
        let current = type;
        let hasProps = false;
        while (current && current !== Object) {
            if (Object.prototype.hasOwnProperty.call(current, PROP_METADATA)) {
                hasProps = true;
                if (checkExistenceOnly) {
                    return (meta.hasPropAnnotations = true);
                }
                const metadata = current[PROP_METADATA];
                for (const { prop, annotationInstance } of metadata) {
                    ((_a = (_b = propMetadata)[prop]) !== null && _a !== void 0 ? _a : (_b[prop] = [])).push(annotationInstance);
                }
            }
            current = this.getParentCtor(current);
        }
        // 3. Finalize
        meta.hasPropAnnotations = hasProps;
        if (!checkExistenceOnly) {
            meta.props = propMetadata;
            return propMetadata;
        }
        return false;
    }
    /**
     * 解析指定类型的所有属性元数据，包括继承的属性。
     * 会合并原型链上的元数据。
     *
     * @param type 要解析属性的类类型。
     * @returns 一个记录对象，键是属性名，值是注解实例数组。
     */
    resolveProperties(type) {
        return this._scanForPropMetadata(type, false);
    }
    hasPropMetadata(type) {
        return this._scanForPropMetadata(type, true);
    }
    /**
     * 解析指定类型的构造函数参数。
     * 结合了设计类型（TypeScript 发射的类型）和显式的参数注解。
     * 优先使用已存在的缓存 (`meta.params`)，否则结合 `resolveParameterAnnotations` 与 `design:paramtypes` 生成并缓存。
     *
     * @param type 要解析参数的类类型。
     * @param methodName 方法名（默认为 'constructor'）。
     * @returns 一个数组，每个元素代表一个参数的依赖（类型或注解）。
     */
    resolveParameters(type, methodName = 'constructor') {
        const meta = this._getMeta(type);
        if (methodName === 'constructor' && meta.params)
            return meta.params;
        const paramAnnotations = this.resolveParameterAnnotations(type, methodName);
        const paramTypes = this._reflect.getMetadata(DESIGN_PARAM_TYPES, type) || EMPTY_ARRAY;
        const len = Math.max(paramTypes.length, paramAnnotations.length);
        if (len === 0) {
            if (methodName === 'constructor')
                meta.params = [];
            return [];
        }
        const result = new Array(len);
        for (let i = 0; i < len; i++) {
            const type = paramTypes[i];
            const annotations = paramAnnotations[i];
            const inputs = type !== undefined ? [type] : [];
            if (annotations)
                inputs.push(...annotations);
            result[i] = inputs;
        }
        if (methodName === 'constructor')
            meta.params = result;
        return result;
    }
    /**
     * 解析特定的类级别注解。
     *
     * @param type 类类型。
     * @param annotationName 要查找的注解名称。
     * @returns 注解实例，如果未找到则返回 null。
     */
    resolveClassAnnotation(type, annotationName) {
        var _a;
        const metadata = this.getOwnMetadata(type, ANNOTATIONS);
        return (_a = metadata.find((m) => m.metadataName === annotationName)) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * 解析指定方法的参数注解。
     * 采用“预分组 (Eager Grouping)”策略：在首次请求时，会一次性扫描该类所有方法的参数注解并建立缓存。
     * 后续对同类中任意方法的查询均为 O(1) 复杂度。
     *
     * @param type 类类型。
     * @param methodName 方法名。
     * @returns 注解数组的数组（每个参数对应一个数组，稀疏数组用 null 填充）。
     */
    resolveParameterAnnotations(type, methodName) {
        var _a, _b;
        const meta = this._getMeta(type);
        if (!meta.hasParamAnnotations) {
            const metadata = this.getOwnMetadata(type, PARAMETERS);
            const paramAnnotations = meta.paramAnnotations = new Map();
            for (const { method, annotationInstance, index } of metadata) {
                let params = paramAnnotations.get(method);
                if (!params) {
                    params = [];
                    paramAnnotations.set(method, params);
                }
                while (params.length <= index)
                    params.push(null);
                ((_a = params[index]) !== null && _a !== void 0 ? _a : (params[index] = [])).push(annotationInstance);
            }
            meta.hasParamAnnotations = true;
        }
        return ((_b = meta.paramAnnotations) === null || _b === void 0 ? void 0 : _b.get(methodName)) || EMPTY_ARRAY;
    }
    /**
     * 解析指定方法的注解，可根据注解名称过滤。
     * 使用按需缓存策略 (`meta.methods`)。
     *
     * @param type 类类型。
     * @param methodName 方法名。
     * @param filterNames 可选的注解名称过滤列表。
     * @returns 匹配的注解实例数组。
     */
    resolveMethodAnnotations(type, methodName, filterNames) {
        const meta = this._getMeta(type);
        if (!meta.methods)
            meta.methods = new Map();
        let result = meta.methods.get(methodName);
        if (!result) {
            const metadata = this.getOwnMetadata(type, METHODS);
            result = [];
            // 反向遍历并 push，替代 unshift 或 reverse，以此提高性能
            for (let i = metadata.length - 1; i >= 0; i--) {
                const { method, annotationInstance } = metadata[i];
                if (method !== methodName)
                    continue;
                result.push(annotationInstance);
            }
            meta.methods.set(methodName, result);
        }
        if (filterNames && filterNames.length > 0) {
            return result.filter((ann) => filterNames.includes(ann.metadataName));
        }
        return result;
    }
    /**
     * 解析属性的 TypeScript 设计类型。
     * 不要与自定义注解混淆。
     *
     * @param type 类类型。
     * @param propertyName 属性名。
     * @returns 设计类型（例如 String, Number 或自定义类）。
     */
    resolvePropertyType(type, propertyName) {
        return this._reflect.getMetadata(DESIGN_PROP_TYPE, type.prototype, propertyName);
    }
    /**
     * 解析给定类型上特定属性的自定义注解。
     * 不会遍历原型链（仅限自有元数据）。
     * 采用“预分组 (Eager Grouping)”策略：在首次请求时，一次性缓存该类所有属性的注解。
     *
     * @param type 类类型。
     * @param propertyName 属性名。
     * @returns 注解实例数组。
     */
    resolvePropertyAnnotations(type, propertyName) {
        var _a;
        const meta = this._getMeta(type);
        if (!meta.hasPropAnnotations) {
            const metadata = this.getOwnMetadata(type, PROP_METADATA);
            const propAnnotations = meta.propAnnotations = new Map();
            for (const { prop, annotationInstance } of metadata) {
                let props = propAnnotations.get(prop);
                if (!props) {
                    props = [];
                    propAnnotations.set(prop, props);
                }
                props.push(annotationInstance);
            }
            meta.hasPropAnnotations = true;
        }
        return ((_a = meta.propAnnotations) === null || _a === void 0 ? void 0 : _a.get(propertyName)) || EMPTY_ARRAY;
    }
    getOwnMetadata(type, key) {
        return (Object.prototype.hasOwnProperty.call(type, key) && type[key]) || EMPTY_ARRAY;
    }
    getParentCtor(ctor) {
        const proto = ctor.prototype;
        const parentProto = proto ? Object.getPrototypeOf(proto) : null;
        return (parentProto === null || parentProto === void 0 ? void 0 : parentProto.constructor) || Object;
    }
}
const reflector = new Reflector();