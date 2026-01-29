"use strict";
/**
 * @file resolution/resolution-checks.ts
 * @description Helpers for checking resolution constraints and flags.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSkipSelf = validateSkipSelf;
exports.checkNoProvider = checkNoProvider;
exports.checkSelfAndOptional = checkSelfAndOptional;
exports.validateResolution = validateResolution;
var metadata_1 = require("../metadata");
function validateSkipSelf(flags) {
    if (flags & metadata_1.InjectFlags.Self)
        throw new Error('Cannot combine SkipSelf and Self flags.');
}
function checkNoProvider(token, flags) {
    if (flags & metadata_1.InjectFlags.Optional)
        return null;
    throw new Error("No provider for ".concat(token.name || token));
}
function checkSelfAndOptional(token, flags, record) {
    if (flags & metadata_1.InjectFlags.Self) {
        if (record || flags & metadata_1.InjectFlags.Optional)
            return record;
        throw new Error("No provider for ".concat(token.name || token));
    }
}
function validateResolution(token, record, flags) {
    if (record && (flags & metadata_1.RecordFlags.MaskFromChild) && (record.flags & metadata_1.RecordFlags.Private)) {
        if (flags & metadata_1.InjectFlags.Optional)
            return;
        throw new Error("No provider for ".concat(token.name || token, " (Private to definition scope)"));
    }
}