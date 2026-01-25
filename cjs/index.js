"use strict";
/**
 * @file index.ts
 * @description Public API for the Dependency Injection system.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setInjectableDef = exports.ROOT_SCOPE = exports.Reflector = exports.markInject = exports.makePropDecorator = exports.makeParamDecorator = exports.makeMethodDecorator = exports.makeDecorator = exports.InjectorToken = exports.IGNORE_SCOPE = exports.Injectable = exports.Optional = exports.Inject = exports.getInjectableDef = exports.forwardRef = exports.DecoratorFlags = exports.AsyncGovernance = exports.resolveMinimalAsync = exports.resolveMinimal = exports.deepProviders = exports.Scope = exports.MultiToken = exports.Token = exports.MethodProxy = exports.InstantiationPolicy = exports.DEBUG_MODE = exports.propArgs = exports.runInInjectionContext = exports.HookMetadata = exports.INTERCEPTORS = exports.INJECTOR_SCOPE = exports.INJECTOR = exports.TokenRegistry = exports.Injector = void 0;
var registry_1 = require("./registry");
Object.defineProperty(exports, "Injector", { enumerable: true, get: function () { return registry_1.Injector; } });
Object.defineProperty(exports, "TokenRegistry", { enumerable: true, get: function () { return registry_1.TokenRegistry; } });
Object.defineProperty(exports, "INJECTOR", { enumerable: true, get: function () { return registry_1.INJECTOR; } });
Object.defineProperty(exports, "INJECTOR_SCOPE", { enumerable: true, get: function () { return registry_1.INJECTOR_SCOPE; } });
Object.defineProperty(exports, "INTERCEPTORS", { enumerable: true, get: function () { return registry_1.INTERCEPTORS; } });
Object.defineProperty(exports, "HookMetadata", { enumerable: true, get: function () { return registry_1.HookMetadata; } });
Object.defineProperty(exports, "runInInjectionContext", { enumerable: true, get: function () { return registry_1.runInInjectionContext; } });
var resolution_1 = require("./resolution");
Object.defineProperty(exports, "propArgs", { enumerable: true, get: function () { return resolution_1.resolveProps; } });
var common_1 = require("./common");
Object.defineProperty(exports, "DEBUG_MODE", { enumerable: true, get: function () { return common_1.DEBUG_MODE; } });
Object.defineProperty(exports, "InstantiationPolicy", { enumerable: true, get: function () { return common_1.InstantiationPolicy; } });
var features_1 = require("./features");
Object.defineProperty(exports, "MethodProxy", { enumerable: true, get: function () { return features_1.MethodProxy; } });
Object.defineProperty(exports, "Token", { enumerable: true, get: function () { return features_1.Token; } });
Object.defineProperty(exports, "MultiToken", { enumerable: true, get: function () { return features_1.MultiToken; } });
Object.defineProperty(exports, "Scope", { enumerable: true, get: function () { return features_1.Scope; } });
var resolution_2 = require("./resolution");
Object.defineProperty(exports, "deepProviders", { enumerable: true, get: function () { return resolution_2.deepProviders; } });
Object.defineProperty(exports, "resolveMinimal", { enumerable: true, get: function () { return resolution_2.resolveMinimal; } });
Object.defineProperty(exports, "resolveMinimalAsync", { enumerable: true, get: function () { return resolution_2.resolveMinimalAsync; } });
Object.defineProperty(exports, "AsyncGovernance", { enumerable: true, get: function () { return resolution_2.AsyncGovernance; } });
var metadata_1 = require("./metadata");
Object.defineProperty(exports, "DecoratorFlags", { enumerable: true, get: function () { return metadata_1.DecoratorFlags; } });
Object.defineProperty(exports, "forwardRef", { enumerable: true, get: function () { return metadata_1.forwardRef; } });
Object.defineProperty(exports, "getInjectableDef", { enumerable: true, get: function () { return metadata_1.getInjectableDef; } });
Object.defineProperty(exports, "Inject", { enumerable: true, get: function () { return metadata_1.Inject; } });
Object.defineProperty(exports, "Optional", { enumerable: true, get: function () { return metadata_1.Optional; } });
Object.defineProperty(exports, "Injectable", { enumerable: true, get: function () { return metadata_1.Injectable; } });
Object.defineProperty(exports, "IGNORE_SCOPE", { enumerable: true, get: function () { return metadata_1.IGNORE_SCOPE; } });
Object.defineProperty(exports, "InjectorToken", { enumerable: true, get: function () { return metadata_1.InjectorToken; } });
Object.defineProperty(exports, "makeDecorator", { enumerable: true, get: function () { return metadata_1.makeDecorator; } });
Object.defineProperty(exports, "makeMethodDecorator", { enumerable: true, get: function () { return metadata_1.makeMethodDecorator; } });
Object.defineProperty(exports, "makeParamDecorator", { enumerable: true, get: function () { return metadata_1.makeParamDecorator; } });
Object.defineProperty(exports, "makePropDecorator", { enumerable: true, get: function () { return metadata_1.makePropDecorator; } });
Object.defineProperty(exports, "markInject", { enumerable: true, get: function () { return metadata_1.markInject; } });
Object.defineProperty(exports, "Reflector", { enumerable: true, get: function () { return metadata_1.Reflector; } });
Object.defineProperty(exports, "ROOT_SCOPE", { enumerable: true, get: function () { return metadata_1.ROOT_SCOPE; } });
Object.defineProperty(exports, "setInjectableDef", { enumerable: true, get: function () { return metadata_1.setInjectableDef; } });
