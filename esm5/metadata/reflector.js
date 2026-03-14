import { __read, __spreadArray, __values } from "tslib";
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-prototype-builtins */
import "./reflect-polyfill.js";
import { ANNOTATIONS, METHODS, PARAMETERS, PROP_METADATA, RESOLVED_META } from "./decorators.js";
var DESIGN_PROP_TYPE = 'design:type';
var DESIGN_PARAM_TYPES = 'design:paramtypes';
var EMPTY_ARRAY = Object.freeze([]);
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
var Reflector = /** @class */ (function () {
    function Reflector() {
        this._reflect = typeof global === 'object' ? global.Reflect : typeof self === 'object' ? self.Reflect : Reflect;
        this._fallbackCache = new WeakMap();
    }
    Reflector.prototype._getMeta = function (type) {
        if (Object.prototype.hasOwnProperty.call(type, RESOLVED_META)) {
            return type[RESOLVED_META];
        }
        var meta = this._fallbackCache.get(type);
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
    };
    /**
     * Resolves all property-level metadata for a class, merged along the prototype chain.
     *
     * @typeParam T - The annotation metadata type (defaults to {@link AnnotationMeta}).
     * @param type - The class constructor to inspect.
     * @returns A map of property names to arrays of annotations.
     */
    Reflector.resolveProperties = function (type) {
        return reflector.resolveProperties(type);
    };
    /**
     * Resolves constructor parameter dependencies, combining TypeScript `design:paramtypes`
     * with explicit parameter annotations (e.g. `@Inject`, `@Optional`).
     *
     * @param type - The class constructor to inspect.
     * @returns An array of {@link ParameterDependency} tuples (one per parameter).
     */
    Reflector.resolveParameters = function (type) {
        return reflector.resolveParameters(type);
    };
    /**
     * Resolves parameter annotations for a specific method (not the constructor).
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @param method - The method name.
     * @returns A 2D array: `result[paramIndex]` is an array of annotations for that parameter.
     */
    Reflector.resolveParameterAnnotations = function (type, method) {
        return reflector.resolveParameterAnnotations(type, method);
    };
    /**
     * Resolves a specific class-level annotation by its `metadataName`.
     *
     * @typeParam T - The expected annotation type (extends {@link Annotation}).
     * @param type - The class constructor to inspect.
     * @param annotationName - The `metadataName` to match (e.g. `'Injectable'`, `'Scope'`).
     * @returns The matching annotation, or `null` if not found.
     */
    Reflector.resolveClassAnnotation = function (type, annotationName) {
        return reflector.resolveClassAnnotation(type, annotationName);
    };
    /**
     * Resolves annotations applied to a specific method, optionally filtered by name.
     *
     * @typeParam T - The expected annotation type.
     * @param type - The class constructor.
     * @param methodName - The method name to inspect.
     * @param filterNames - Optional array of `metadataName` values to filter by.
     * @returns An array of matching annotations.
     */
    Reflector.resolveMethodAnnotations = function (type, methodName, filterNames) {
        return reflector.resolveMethodAnnotations(type, methodName, filterNames);
    };
    /**
     * Resolves the TypeScript `design:type` metadata for a property.
     *
     * @typeParam T - The expected type reference.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns The design-time type constructor (e.g. `String`, `Number`, a class).
     */
    Reflector.resolvePropertyType = function (type, propertyName) {
        return reflector.resolvePropertyType(type, propertyName);
    };
    /**
     * Resolves custom annotations for a specific property.
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns An array of annotations applied to the property.
     */
    Reflector.resolvePropertyAnnotations = function (type, propertyName) {
        return reflector.resolvePropertyAnnotations(type, propertyName);
    };
    /**
     * Checks whether a class (or any ancestor) has property-level metadata.
     *
     * Use this as a fast gate before calling `resolveProperties()` to avoid
     * unnecessary prototype-chain traversal.
     *
     * @param type - The class constructor.
     * @returns `true` if any property metadata exists.
     */
    Reflector.hasPropMetadata = function (type) {
        return reflector.hasPropMetadata(type);
    };
    Reflector.prototype._checkHasPropMetadata = function (type) {
        var meta = this._getMeta(type);
        if (meta.props)
            return Object.keys(meta.props).length > 0;
        if (meta.hasPropAnnotations !== undefined)
            return meta.hasPropAnnotations;
        var current = type;
        while (current && current !== Object) {
            if (Object.prototype.hasOwnProperty.call(current, PROP_METADATA)) {
                return (meta.hasPropAnnotations = true);
            }
            current = this.getParentCtor(current);
        }
        return (meta.hasPropAnnotations = false);
    };
    Reflector.prototype._collectPropMetadata = function (type) {
        var e_1, _a;
        var _b;
        var meta = this._getMeta(type);
        if (meta.props)
            return meta.props;
        var propMetadata = {};
        var current = type;
        var hasProps = false;
        while (current && current !== Object) {
            if (Object.prototype.hasOwnProperty.call(current, PROP_METADATA)) {
                hasProps = true;
                var metadata = current[PROP_METADATA];
                try {
                    for (var metadata_1 = (e_1 = void 0, __values(metadata)), metadata_1_1 = metadata_1.next(); !metadata_1_1.done; metadata_1_1 = metadata_1.next()) {
                        var _c = metadata_1_1.value, prop = _c.prop, annotationInstance = _c.annotationInstance;
                        ((_b = propMetadata[prop]) !== null && _b !== void 0 ? _b : (propMetadata[prop] = [])).push(annotationInstance);
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
        meta.hasPropAnnotations = hasProps;
        meta.props = propMetadata;
        return propMetadata;
    };
    /**
     * Resolves all property metadata for a type, merging along the prototype chain.
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @returns A map of property names to arrays of annotations.
     */
    Reflector.prototype.resolveProperties = function (type) {
        return this._collectPropMetadata(type);
    };
    Reflector.prototype.hasPropMetadata = function (type) {
        return this._checkHasPropMetadata(type);
    };
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
                inputs.push.apply(inputs, __spreadArray([], __read(annotations), false));
            result[i] = inputs;
        }
        if (methodName === 'constructor')
            meta.params = result;
        return result;
    };
    /**
     * Resolves a specific class-level annotation by its `metadataName`, or returns `null`.
     *
     * @typeParam T - The expected annotation type.
     * @param type - The class constructor.
     * @param annotationName - The metadata name to match.
     * @returns The annotation or `null`.
     */
    Reflector.prototype.resolveClassAnnotation = function (type, annotationName) {
        var _a;
        var metadata = this.getOwnMetadata(type, ANNOTATIONS);
        return (_a = metadata.find(function (m) { return m.metadataName === annotationName; })) !== null && _a !== void 0 ? _a : null;
    };
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
    Reflector.prototype.resolveParameterAnnotations = function (type, methodName) {
        var e_2, _a;
        var _b, _c, _d;
        var meta = this._getMeta(type);
        if (!meta.hasParamAnnotations) {
            var metadata = this.getOwnMetadata(type, PARAMETERS);
            var paramAnnotations = meta.paramAnnotations = new Map();
            try {
                for (var metadata_2 = __values(metadata), metadata_2_1 = metadata_2.next(); !metadata_2_1.done; metadata_2_1 = metadata_2.next()) {
                    var _e = metadata_2_1.value, method = _e.method, annotationInstance = _e.annotationInstance, index = _e.index;
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
        return ((_d = (_c = meta.paramAnnotations) === null || _c === void 0 ? void 0 : _c.get(methodName)) !== null && _d !== void 0 ? _d : EMPTY_ARRAY);
    };
    /**
     * Resolves annotations applied to a method, optionally filtered by annotation name.
     *
     * @typeParam T - The expected annotation type.
     * @param type - The class constructor.
     * @param methodName - The method name.
     * @param filterNames - Optional list of `metadataName` values to include.
     * @returns An array of matching annotations.
     */
    Reflector.prototype.resolveMethodAnnotations = function (type, methodName, filterNames) {
        var meta = this._getMeta(type);
        if (!meta.methods)
            meta.methods = new Map();
        var result = meta.methods.get(methodName);
        if (!result) {
            var metadata = this.getOwnMetadata(type, METHODS);
            result = [];
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
     * Resolves the TypeScript `design:type` metadata for a property.
     *
     * @typeParam T - The expected type.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns The design-time type constructor.
     */
    Reflector.prototype.resolvePropertyType = function (type, propertyName) {
        return this._reflect.getMetadata(DESIGN_PROP_TYPE, type.prototype, propertyName);
    };
    /**
     * Resolves custom annotations for a property (own metadata only, eagerly cached).
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns An array of annotations.
     */
    Reflector.prototype.resolvePropertyAnnotations = function (type, propertyName) {
        var e_3, _a;
        var _b, _c;
        var meta = this._getMeta(type);
        if (!meta.hasPropAnnotations) {
            var metadata = this.getOwnMetadata(type, PROP_METADATA);
            var propAnnotations = meta.propAnnotations = new Map();
            try {
                for (var metadata_3 = __values(metadata), metadata_3_1 = metadata_3.next(); !metadata_3_1.done; metadata_3_1 = metadata_3.next()) {
                    var _d = metadata_3_1.value, prop = _d.prop, annotationInstance = _d.annotationInstance;
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
        return ((_c = (_b = meta.propAnnotations) === null || _b === void 0 ? void 0 : _b.get(propertyName)) !== null && _c !== void 0 ? _c : EMPTY_ARRAY);
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
export { Reflector };
var reflector = new Reflector();