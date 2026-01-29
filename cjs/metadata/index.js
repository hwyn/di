"use strict";
/**
 * @file metadata/index.ts
 * @description Exports all metadata-related definitions (decorators, tokens, providers).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInjectableDef = exports.INJECTOR_PROV_DEF = void 0;
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./constants"), exports);
tslib_1.__exportStar(require("./decorators"), exports);
tslib_1.__exportStar(require("./injectable"), exports);
var metadata_keys_1 = require("./metadata-keys");
Object.defineProperty(exports, "INJECTOR_PROV_DEF", { enumerable: true, get: function () { return metadata_keys_1.INJECTOR_PROV_DEF; } });
Object.defineProperty(exports, "getInjectableDef", { enumerable: true, get: function () { return metadata_keys_1.getInjectableDef; } });
tslib_1.__exportStar(require("./provider"), exports);
tslib_1.__exportStar(require("./reflector"), exports);
tslib_1.__exportStar(require("./injector-token"), exports);