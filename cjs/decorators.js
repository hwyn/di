"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePropDecorator = exports.makeMethodDecorator = exports.makeParamDecorator = exports.makeDecorator = exports.PROP_METADATA = exports.METHODS = exports.PARAMETERS = exports.ANNOTATIONS = void 0;
var tslib_1 = require("tslib");
exports.ANNOTATIONS = '__annotations__';
exports.PARAMETERS = '__parameters__';
exports.METHODS = '__methods__';
exports.PROP_METADATA = '__prop__metadata__';
function hasOwnProperty(object, v) {
    return Object.prototype.hasOwnProperty.call(object, v);
}
function makeMetadataCtor(props) {
    return function ctor() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (props) {
            var values = props.apply(void 0, args);
            for (var propName in values) {
                this[propName] = values[propName];
            }
        }
        return this;
    };
}
function makeDecorator(name, props, typeFn) {
    var metaCtor = makeMetadataCtor(props);
    function DecoratorFactory() {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this instanceof DecoratorFactory) {
            return metaCtor.apply(this, args);
        }
        var annotationInstance = new ((_a = DecoratorFactory).bind.apply(_a, tslib_1.__spreadArray([void 0], args, false)))();
        return function TypeDecorator(cls) {
            var annotations = hasOwnProperty(cls, exports.ANNOTATIONS) ? cls[exports.ANNOTATIONS] : Object.defineProperty(cls, exports.ANNOTATIONS, { value: [] })[exports.ANNOTATIONS];
            annotations.push(annotationInstance);
            return typeFn && typeFn.apply(void 0, tslib_1.__spreadArray([cls], args, false)) || cls;
        };
    }
    DecoratorFactory.prototype.metadataName = name;
    return DecoratorFactory;
}
exports.makeDecorator = makeDecorator;
function makeParamDecorator(name, props) {
    var metaCtor = makeMetadataCtor(props);
    function ParamDecoratorFactory() {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this instanceof ParamDecoratorFactory) {
            return metaCtor.apply(this, args);
        }
        var annotationInstance = new ((_a = ParamDecoratorFactory).bind.apply(_a, tslib_1.__spreadArray([void 0], args, false)))();
        function ParamDecorator(cls, name, index) {
            var parameters = hasOwnProperty(cls, exports.PARAMETERS) ? cls[exports.PARAMETERS] : Object.defineProperty(cls, exports.PARAMETERS, { value: [] })[exports.PARAMETERS];
            while (parameters.length <= index)
                parameters.push(null);
            (parameters[index] = parameters[index] || []).push(annotationInstance);
            return cls;
        }
        ParamDecorator.annotation = annotationInstance;
        return ParamDecorator;
    }
    ParamDecoratorFactory.prototype.metadataName = name;
    return ParamDecoratorFactory;
}
exports.makeParamDecorator = makeParamDecorator;
function makeMethodDecorator(name, props, typeFn) {
    var metaCtor = makeMetadataCtor(props);
    function MethodDecoratorFactory() {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this instanceof MethodDecoratorFactory) {
            return metaCtor.apply(this, args);
        }
        var annotationInstance = new ((_a = MethodDecoratorFactory).bind.apply(_a, tslib_1.__spreadArray([void 0], args, false)))();
        function MethodDecorator(_a, method, descriptor) {
            var constructor = _a.constructor;
            var methods = hasOwnProperty(constructor, exports.METHODS) ? constructor[exports.METHODS] : Object.defineProperty(constructor, exports.METHODS, { value: [] })[exports.METHODS];
            methods.push({ method: method, descriptor: descriptor, annotationInstance: annotationInstance });
            typeFn && typeFn.apply(void 0, tslib_1.__spreadArray([constructor, method, descriptor], args, false));
        }
        MethodDecorator.annotation = annotationInstance;
        return MethodDecorator;
    }
    MethodDecoratorFactory.prototype.metadataName = name;
    return MethodDecoratorFactory;
}
exports.makeMethodDecorator = makeMethodDecorator;
function makePropDecorator(name, props, typeFn) {
    var metaCtor = makeMetadataCtor(props);
    function PropDecoratorFactory() {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this instanceof PropDecoratorFactory) {
            return metaCtor.apply(this, args);
        }
        var annotationInstance = new ((_a = PropDecoratorFactory).bind.apply(_a, tslib_1.__spreadArray([void 0], args, false)))();
        function PropDecorator(_a, prop) {
            var constructor = _a.constructor;
            var meta = hasOwnProperty(constructor, exports.PROP_METADATA) ? constructor[exports.PROP_METADATA] : Object.defineProperty(constructor, exports.PROP_METADATA, { value: {} })[exports.PROP_METADATA];
            meta[prop] = hasOwnProperty(meta, prop) && meta[prop] || [];
            meta[prop].unshift(annotationInstance);
            typeFn && typeFn.apply(void 0, tslib_1.__spreadArray([constructor, prop], args, false));
        }
        return PropDecorator;
    }
    PropDecoratorFactory.prototype.metadataName = name;
    return PropDecoratorFactory;
}
exports.makePropDecorator = makePropDecorator;
