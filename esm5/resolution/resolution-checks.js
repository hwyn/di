import { InjectFlags, RecordFlags } from "../metadata/index.js";
import { getSecureTokenName } from "../common/index.js";
export function validateSkipSelf(flags) {
    if (flags & InjectFlags.Self)
        throw new Error('Cannot combine SkipSelf and Self flags.');
}
export function checkNoProvider(token, flags) {
    if (flags & InjectFlags.Optional)
        return null;
    var msg = "No provider for ".concat(getSecureTokenName(token));
    throw new Error(msg);
}
export function checkSelfAndOptional(token, flags, record) {
    if (flags & InjectFlags.Self) {
        if (record || flags & InjectFlags.Optional)
            return record;
        var msg = "No provider for ".concat(getSecureTokenName(token));
        throw new Error(msg);
    }
}
export function validateResolution(token, record, flags) {
    if (record && (flags & RecordFlags.MaskFromChild) && (record.flags & RecordFlags.Private)) {
        if (flags & InjectFlags.Optional)
            return;
        var msg = "No provider for ".concat(getSecureTokenName(token), " (Private to definition scope)");
        throw new Error(msg);
    }
}