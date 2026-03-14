/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-prototype-builtins */
import "./reflect-polyfill.js";
import { ANNOTATIONS, METHODS, PARAMETERS, PROP_METADATA, RESOLVED_META } from "./decorators.js";
const DESIGN_PROP_TYPE = 'design:type';
const DESIGN_PARAM_TYPES = 'design:paramtypes';
const EMPTY_ARRAY = Object.freeze([]);
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
    /**
     * Resolves all property-level metadata for a class, merged along the prototype chain.
     *
     * @typeParam T - The annotation metadata type (defaults to {@link AnnotationMeta}).
     * @param type - The class constructor to inspect.
     * @returns A map of property names to arrays of annotations.
     */
    static resolveProperties(type) {
        return reflector.resolveProperties(type);
    }
    /**
     * Resolves constructor parameter dependencies, combining TypeScript `design:paramtypes`
     * with explicit parameter annotations (e.g. `@Inject`, `@Optional`).
     *
     * @param type - The class constructor to inspect.
     * @returns An array of {@link ParameterDependency} tuples (one per parameter).
     */
    static resolveParameters(type) {
        return reflector.resolveParameters(type);
    }
    /**
     * Resolves parameter annotations for a specific method (not the constructor).
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @param method - The method name.
     * @returns A 2D array: `result[paramIndex]` is an array of annotations for that parameter.
     */
    static resolveParameterAnnotations(type, method) {
        return reflector.resolveParameterAnnotations(type, method);
    }
    /**
     * Resolves a specific class-level annotation by its `metadataName`.
     *
     * @typeParam T - The expected annotation type (extends {@link Annotation}).
     * @param type - The class constructor to inspect.
     * @param annotationName - The `metadataName` to match (e.g. `'Injectable'`, `'Scope'`).
     * @returns The matching annotation, or `null` if not found.
     */
    static resolveClassAnnotation(type, annotationName) {
        return reflector.resolveClassAnnotation(type, annotationName);
    }
    /**
     * Resolves annotations applied to a specific method, optionally filtered by name.
     *
     * @typeParam T - The expected annotation type.
     * @param type - The class constructor.
     * @param methodName - The method name to inspect.
     * @param filterNames - Optional array of `metadataName` values to filter by.
     * @returns An array of matching annotations.
     */
    static resolveMethodAnnotations(type, methodName, filterNames) {
        return reflector.resolveMethodAnnotations(type, methodName, filterNames);
    }
    /**
     * Resolves the TypeScript `design:type` metadata for a property.
     *
     * @typeParam T - The expected type reference.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns The design-time type constructor (e.g. `String`, `Number`, a class).
     */
    static resolvePropertyType(type, propertyName) {
        return reflector.resolvePropertyType(type, propertyName);
    }
    /**
     * Resolves custom annotations for a specific property.
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns An array of annotations applied to the property.
     */
    static resolvePropertyAnnotations(type, propertyName) {
        return reflector.resolvePropertyAnnotations(type, propertyName);
    }
    /**
     * Checks whether a class (or any ancestor) has property-level metadata.
     *
     * Use this as a fast gate before calling `resolveProperties()` to avoid
     * unnecessary prototype-chain traversal.
     *
     * @param type - The class constructor.
     * @returns `true` if any property metadata exists.
     */
    static hasPropMetadata(type) {
        return reflector.hasPropMetadata(type);
    }
    _checkHasPropMetadata(type) {
        const meta = this._getMeta(type);
        if (meta.props)
            return Object.keys(meta.props).length > 0;
        if (meta.hasPropAnnotations !== undefined)
            return meta.hasPropAnnotations;
        let current = type;
        while (current && current !== Object) {
            if (Object.prototype.hasOwnProperty.call(current, PROP_METADATA)) {
                return (meta.hasPropAnnotations = true);
            }
            current = this.getParentCtor(current);
        }
        return (meta.hasPropAnnotations = false);
    }
    _collectPropMetadata(type) {
        var _a;
        const meta = this._getMeta(type);
        if (meta.props)
            return meta.props;
        const propMetadata = {};
        let current = type;
        let hasProps = false;
        while (current && current !== Object) {
            if (Object.prototype.hasOwnProperty.call(current, PROP_METADATA)) {
                hasProps = true;
                const metadata = current[PROP_METADATA];
                for (const { prop, annotationInstance } of metadata) {
                    ((_a = propMetadata[prop]) !== null && _a !== void 0 ? _a : (propMetadata[prop] = [])).push(annotationInstance);
                }
            }
            current = this.getParentCtor(current);
        }
        meta.hasPropAnnotations = hasProps;
        meta.props = propMetadata;
        return propMetadata;
    }
    /**
     * Resolves all property metadata for a type, merging along the prototype chain.
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @returns A map of property names to arrays of annotations.
     */
    resolveProperties(type) {
        return this._collectPropMetadata(type);
    }
    hasPropMetadata(type) {
        return this._checkHasPropMetadata(type);
    }
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
     * Resolves a specific class-level annotation by its `metadataName`, or returns `null`.
     *
     * @typeParam T - The expected annotation type.
     * @param type - The class constructor.
     * @param annotationName - The metadata name to match.
     * @returns The annotation or `null`.
     */
    resolveClassAnnotation(type, annotationName) {
        var _a;
        const metadata = this.getOwnMetadata(type, ANNOTATIONS);
        return (_a = metadata.find((m) => m.metadataName === annotationName)) !== null && _a !== void 0 ? _a : null;
    }
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
    resolveParameterAnnotations(type, methodName) {
        var _a, _b, _c;
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
        return ((_c = (_b = meta.paramAnnotations) === null || _b === void 0 ? void 0 : _b.get(methodName)) !== null && _c !== void 0 ? _c : EMPTY_ARRAY);
    }
    /**
     * Resolves annotations applied to a method, optionally filtered by annotation name.
     *
     * @typeParam T - The expected annotation type.
     * @param type - The class constructor.
     * @param methodName - The method name.
     * @param filterNames - Optional list of `metadataName` values to include.
     * @returns An array of matching annotations.
     */
    resolveMethodAnnotations(type, methodName, filterNames) {
        const meta = this._getMeta(type);
        if (!meta.methods)
            meta.methods = new Map();
        let result = meta.methods.get(methodName);
        if (!result) {
            const metadata = this.getOwnMetadata(type, METHODS);
            result = [];
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
     * Resolves the TypeScript `design:type` metadata for a property.
     *
     * @typeParam T - The expected type.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns The design-time type constructor.
     */
    resolvePropertyType(type, propertyName) {
        return this._reflect.getMetadata(DESIGN_PROP_TYPE, type.prototype, propertyName);
    }
    /**
     * Resolves custom annotations for a property (own metadata only, eagerly cached).
     *
     * @typeParam T - The annotation metadata type.
     * @param type - The class constructor.
     * @param propertyName - The property name.
     * @returns An array of annotations.
     */
    resolvePropertyAnnotations(type, propertyName) {
        var _a, _b;
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
        return ((_b = (_a = meta.propAnnotations) === null || _a === void 0 ? void 0 : _a.get(propertyName)) !== null && _b !== void 0 ? _b : EMPTY_ARRAY);
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