/**
 * @file resolution/contextual-injector.ts
 * @description A proxy injector used to propagate internal resolution state (like cycle detection stacks)
 * without exposing it to the public API or user factory functions.
 */
export class ContextualInjector {
    get destroyed() { return this.parent.destroyed; }
    get interceptStrategy() { return this.parent.interceptStrategy; }
    constructor(parent, stack) {
        this.parent = parent;
        this.stack = stack;
    }
    get(token, flags) { return this.parent.get(token, flags); }
    getAsync(token, flags) { return this.parent.getAsync(token, flags, this.stack); }
    set(token, provider) { return this.parent.set(token, provider); }
    destroy() { }
}
