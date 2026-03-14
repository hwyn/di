"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSkipSelf = validateSkipSelf;
exports.checkNoProvider = checkNoProvider;
exports.checkSelfAndOptional = checkSelfAndOptional;
exports.validateResolution = validateResolution;
var metadata_1 = require("../metadata");
var common_1 = require("../common");
function validateSkipSelf(flags) {
    if (flags & metadata_1.InjectFlags.Self)
        throw new Error('Cannot combine SkipSelf and Self flags.');
}
function checkNoProvider(token, flags) {
    if (flags & metadata_1.InjectFlags.Optional)
        return null;
    var msg = "No provider for ".concat((0, common_1.getSecureTokenName)(token));
    throw new Error(msg);
}
function checkSelfAndOptional(token, flags, record) {
    if (flags & metadata_1.InjectFlags.Self) {
        if (record || flags & metadata_1.InjectFlags.Optional)
            return record;
        var msg = "No provider for ".concat((0, common_1.getSecureTokenName)(token));
        throw new Error(msg);
    }
}
function validateResolution(token, record, flags) {
    if (record && (flags & metadata_1.RecordFlags.MaskFromChild) && (record.flags & metadata_1.RecordFlags.Private)) {
        if (flags & metadata_1.InjectFlags.Optional)
            return;
        var msg = "No provider for ".concat((0, common_1.getSecureTokenName)(token), " (Private to definition scope)");
        throw new Error(msg);
    }
}