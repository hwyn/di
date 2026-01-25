"use strict";
/**
 * @file features/index.ts
 * @description Exports optional features built on top of the DI core.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./method.proxy"), exports);
tslib_1.__exportStar(require("./token-binding"), exports);
tslib_1.__exportStar(require("./scope"), exports);
