/**
 * @file resolution/resolution-checks.ts
 * @description Helpers for checking resolution constraints and flags.
 */
import { InjectFlags, RecordFlags } from "../metadata/index.js";
export function validateSkipSelf(flags) {
    if (flags & InjectFlags.Self)
        throw new Error('Cannot combine SkipSelf and Self flags.');
}
export function checkNoProvider(token, flags) {
    if (flags & InjectFlags.Optional)
        return null;
    throw new Error("No provider for ".concat(token.name || token));
}
export function checkSelfAndOptional(token, flags, record) {
    if (flags & InjectFlags.Self) {
        if (record || flags & InjectFlags.Optional)
            return record;
        throw new Error("No provider for ".concat(token.name || token));
    }
}
export function validateResolution(token, record, flags) {
    if (record && (flags & RecordFlags.MaskFromChild) && (record.flags & RecordFlags.Private)) {
        if (flags & InjectFlags.Optional)
            return;
        throw new Error("No provider for ".concat(token.name || token, " (Private to definition scope)"));
    }
}