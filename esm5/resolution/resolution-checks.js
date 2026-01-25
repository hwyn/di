/**
 * @file resolution/resolution-checks.ts
 * @description Helpers for checking resolution constraints and flags.
 */
export function validateSkipSelf(flags) {
    if (flags & 2 /* InjectFlags.Self */)
        throw new Error('Cannot combine SkipSelf and Self flags.');
}
export function checkNoProvider(token, flags) {
    if (flags & 1 /* InjectFlags.Optional */)
        return null;
    throw new Error("No provider for ".concat(token.name || token));
}
export function checkSelfAndOptional(token, flags, record) {
    if (flags & 2 /* InjectFlags.Self */) {
        if (record || flags & 1 /* InjectFlags.Optional */)
            return record;
        throw new Error("No provider for ".concat(token.name || token));
    }
}
export function validateResolution(token, record, flags) {
    if (record && (flags & 134217728 /* RecordFlags.MaskFromChild */) && (record.flags & 268435456 /* RecordFlags.Private */)) {
        if (flags & 1 /* InjectFlags.Optional */)
            return;
        throw new Error("No provider for ".concat(token.name || token, " (Private to definition scope)"));
    }
}
