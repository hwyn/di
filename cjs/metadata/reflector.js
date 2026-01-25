"use strict";
/**
 * @file meta/reflector.ts
 * @description Provides a mechanism to read metadata (annotations) from types and caching logic.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reflector = void 0;
var tslib_1 = require("tslib");
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-prototype-builtins */
require("reflect-metadata");
var decorators_1 = require("./decorators");
var DESIGN_PROP_TYPE = 'design:type';
var DESIGN_PARAM_TYPES = 'design:paramtypes';
var EMPTY_ARRAY = Object.freeze([]);
var Reflector = /** @class */ (function () {
    function Reflector() {
        this._reflect = typeof global === 'object' ? global.Reflect : typeof self === 'object' ? self.Reflect : Reflect;
        this._fallbackCache = new WeakMap();
    }
    Reflector.prototype._getMeta = function (type) {
        if (Object.prototype.hasOwnProperty.call(type, decorators_1.RESOLVED_META)) {
            return type[decorators_1.RESOLVED_META];
        }
        var meta = this._fallbackCache.get(type);
        if (meta)
            return meta;
        meta = {};
        try {
            if (Object.isExtensible(type)) {
                Object.defineProperty(type, decorators_1.RESOLVED_META, {
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
    };
    Reflector.resolveProperties = function (type) {
        return reflector.resolveProperties(type);
    };
    Reflector.resolveParameters = function (type) {
        return reflector.resolveParameters(type);
    };
    Reflector.resolveParameterAnnotations = function (type, method) {
        return reflector.resolveParameterAnnotations(type, method);
    };
    Reflector.resolveClassAnnotation = function (type, annotationName) {
        return reflector.resolveClassAnnotation(type, annotationName);
    };
    Reflector.resolveMethodAnnotations = function (type, methodName, filterNames) {
        return reflector.resolveMethodAnnotations(type, methodName, filterNames);
    };
    Reflector.resolvePropertyType = function (type, propertyName) {
        return reflector.resolvePropertyType(type, propertyName);
    };
    Reflector.resolvePropertyAnnotations = function (type, propertyName) {
        return reflector.resolvePropertyAnnotations(type, propertyName);
    };
    Reflector.hasPropMetadata = function (type) {
        return reflector.hasPropMetadata(type);
    };
    /**
     * 内部通用扫描方法，支持两种模式：
     * 1. 仅检查存在性 (checkExistenceOnly=true)：发现属性元数据即返回 true，否则 false。
     * 2. 完整解析 (checkExistenceOnly=false)：收集并缓存所有属性元数据，返回 Record 对象。
     */
    Reflector.prototype._scanForPropMetadata = function (type, checkExistenceOnly) {
        var e_1, _a;
        var _b;
        var _c;
        var meta = this._getMeta(type);
        // 1. Fast Path: Cache Hit
        if (meta.props) {
            return checkExistenceOnly ? Object.keys(meta.props).length > 0 : meta.props;
        }
        if (checkExistenceOnly && meta.hasPropAnnotations !== undefined) {
            return meta.hasPropAnnotations;
        }
        // 2. Traversal Logic
        var propMetadata = checkExistenceOnly ? null : {};
        var current = type;
        var hasProps = false;
        while (current && current !== Object) {
            if (Object.prototype.hasOwnProperty.call(current, decorators_1.PROP_METADATA)) {
                hasProps = true;
                if (checkExistenceOnly) {
                    return (meta.hasPropAnnotations = true);
                }
                var metadata = current[decorators_1.PROP_METADATA];
                try {
                    for (var metadata_1 = (e_1 = void 0, tslib_1.__values(metadata)), metadata_1_1 = metadata_1.next(); !metadata_1_1.done; metadata_1_1 = metadata_1.next()) {
                        var _d = metadata_1_1.value, prop = _d.prop, annotationInstance = _d.annotationInstance;
                        ((_b = (_c = propMetadata)[prop]) !== null && _b !== void 0 ? _b : (_c[prop] = [])).push(annotationInstance);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (metadata_1_1 && !metadata_1_1.done && (_a = metadata_1.return)) _a.call(metadata_1);
                    }
                    finally { if (e_1) throw e_1.error; }
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
    };
    /**
     * 解析指定类型的所有属性元数据，包括继承的属性。
     * 会合并原型链上的元数据。
     *
     * @param type 要解析属性的类类型。
     * @returns 一个记录对象，键是属性名，值是注解实例数组。
     */
    Reflector.prototype.resolveProperties = function (type) {
        return this._scanForPropMetadata(type, false);
    };
    Reflector.prototype.hasPropMetadata = function (type) {
        return this._scanForPropMetadata(type, true);
    };
    /**
     * 解析指定类型的构造函数参数。
     * 结合了设计类型（TypeScript 发射的类型）和显式的参数注解。
     * 优先使用已存在的缓存 (`meta.params`)，否则结合 `resolveParameterAnnotations` 与 `design:paramtypes` 生成并缓存。
     *
     * @param type 要解析参数的类类型。
     * @param methodName 方法名（默认为 'constructor'）。
     * @returns 一个数组，每个元素代表一个参数的依赖（类型或注解）。
     */
    Reflector.prototype.resolveParameters = function (type, methodName) {
        if (methodName === void 0) { methodName = 'constructor'; }
        var meta = this._getMeta(type);
        if (methodName === 'constructor' && meta.params)
            return meta.params;
        var paramAnnotations = this.resolveParameterAnnotations(type, methodName);
        var paramTypes = this._reflect.getMetadata(DESIGN_PARAM_TYPES, type) || EMPTY_ARRAY;
        var len = Math.max(paramTypes.length, paramAnnotations.length);
        if (len === 0) {
            if (methodName === 'constructor')
                meta.params = [];
            return [];
        }
        var result = new Array(len);
        for (var i = 0; i < len; i++) {
            var type_1 = paramTypes[i];
            var annotations = paramAnnotations[i];
            var inputs = type_1 !== undefined ? [type_1] : [];
            if (annotations)
                inputs.push.apply(inputs, tslib_1.__spreadArray([], tslib_1.__read(annotations), false));
            result[i] = inputs;
        }
        if (methodName === 'constructor')
            meta.params = result;
        return result;
    };
    /**
     * 解析特定的类级别注解。
     *
     * @param type 类类型。
     * @param annotationName 要查找的注解名称。
     * @returns 注解实例，如果未找到则返回 null。
     */
    Reflector.prototype.resolveClassAnnotation = function (type, annotationName) {
        var _a;
        var metadata = this.getOwnMetadata(type, decorators_1.ANNOTATIONS);
        return (_a = metadata.find(function (m) { return m.metadataName === annotationName; })) !== null && _a !== void 0 ? _a : null;
    };
    /**
     * 解析指定方法的参数注解。
     * 采用“预分组 (Eager Grouping)”策略：在首次请求时，会一次性扫描该类所有方法的参数注解并建立缓存。
     * 后续对同类中任意方法的查询均为 O(1) 复杂度。
     *
     * @param type 类类型。
     * @param methodName 方法名。
     * @returns 注解数组的数组（每个参数对应一个数组，稀疏数组用 null 填充）。
     */
    Reflector.prototype.resolveParameterAnnotations = function (type, methodName) {
        var e_2, _a;
        var _b, _c;
        var meta = this._getMeta(type);
        if (!meta.hasParamAnnotations) {
            var metadata = this.getOwnMetadata(type, decorators_1.PARAMETERS);
            var paramAnnotations = meta.paramAnnotations = new Map();
            try {
                for (var metadata_2 = tslib_1.__values(metadata), metadata_2_1 = metadata_2.next(); !metadata_2_1.done; metadata_2_1 = metadata_2.next()) {
                    var _d = metadata_2_1.value, method = _d.method, annotationInstance = _d.annotationInstance, index = _d.index;
                    var params = paramAnnotations.get(method);
                    if (!params) {
                        params = [];
                        paramAnnotations.set(method, params);
                    }
                    while (params.length <= index)
                        params.push(null);
                    ((_b = params[index]) !== null && _b !== void 0 ? _b : (params[index] = [])).push(annotationInstance);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (metadata_2_1 && !metadata_2_1.done && (_a = metadata_2.return)) _a.call(metadata_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            meta.hasParamAnnotations = true;
        }
        return ((_c = meta.paramAnnotations) === null || _c === void 0 ? void 0 : _c.get(methodName)) || EMPTY_ARRAY;
    };
    /**
     * 解析指定方法的注解，可根据注解名称过滤。
     * 使用按需缓存策略 (`meta.methods`)。
     *
     * @param type 类类型。
     * @param methodName 方法名。
     * @param filterNames 可选的注解名称过滤列表。
     * @returns 匹配的注解实例数组。
     */
    Reflector.prototype.resolveMethodAnnotations = function (type, methodName, filterNames) {
        var meta = this._getMeta(type);
        if (!meta.methods)
            meta.methods = new Map();
        var result = meta.methods.get(methodName);
        if (!result) {
            var metadata = this.getOwnMetadata(type, decorators_1.METHODS);
            result = [];
            // 反向遍历并 push，替代 unshift 或 reverse，以此提高性能
            for (var i = metadata.length - 1; i >= 0; i--) {
                var _a = metadata[i], method = _a.method, annotationInstance = _a.annotationInstance;
                if (method !== methodName)
                    continue;
                result.push(annotationInstance);
            }
            meta.methods.set(methodName, result);
        }
        if (filterNames && filterNames.length > 0) {
            return result.filter(function (ann) { return filterNames.includes(ann.metadataName); });
        }
        return result;
    };
    /**
     * 解析属性的 TypeScript 设计类型。
     * 不要与自定义注解混淆。
     *
     * @param type 类类型。
     * @param propertyName 属性名。
     * @returns 设计类型（例如 String, Number 或自定义类）。
     */
    Reflector.prototype.resolvePropertyType = function (type, propertyName) {
        return this._reflect.getMetadata(DESIGN_PROP_TYPE, type.prototype, propertyName);
    };
    /**
     * 解析给定类型上特定属性的自定义注解。
     * 不会遍历原型链（仅限自有元数据）。
     * 采用“预分组 (Eager Grouping)”策略：在首次请求时，一次性缓存该类所有属性的注解。
     *
     * @param type 类类型。
     * @param propertyName 属性名。
     * @returns 注解实例数组。
     */
    Reflector.prototype.resolvePropertyAnnotations = function (type, propertyName) {
        var e_3, _a;
        var _b;
        var meta = this._getMeta(type);
        if (!meta.hasPropAnnotations) {
            var metadata = this.getOwnMetadata(type, decorators_1.PROP_METADATA);
            var propAnnotations = meta.propAnnotations = new Map();
            try {
                for (var metadata_3 = tslib_1.__values(metadata), metadata_3_1 = metadata_3.next(); !metadata_3_1.done; metadata_3_1 = metadata_3.next()) {
                    var _c = metadata_3_1.value, prop = _c.prop, annotationInstance = _c.annotationInstance;
                    var props = propAnnotations.get(prop);
                    if (!props) {
                        props = [];
                        propAnnotations.set(prop, props);
                    }
                    props.push(annotationInstance);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (metadata_3_1 && !metadata_3_1.done && (_a = metadata_3.return)) _a.call(metadata_3);
                }
                finally { if (e_3) throw e_3.error; }
            }
            meta.hasPropAnnotations = true;
        }
        return ((_b = meta.propAnnotations) === null || _b === void 0 ? void 0 : _b.get(propertyName)) || EMPTY_ARRAY;
    };
    Reflector.prototype.getOwnMetadata = function (type, key) {
        return (Object.prototype.hasOwnProperty.call(type, key) && type[key]) || EMPTY_ARRAY;
    };
    Reflector.prototype.getParentCtor = function (ctor) {
        var proto = ctor.prototype;
        var parentProto = proto ? Object.getPrototypeOf(proto) : null;
        return (parentProto === null || parentProto === void 0 ? void 0 : parentProto.constructor) || Object;
    };
    return Reflector;
}());
exports.Reflector = Reflector;
var reflector = new Reflector();
