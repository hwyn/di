/**
 * @file resolution/contextual-injector.ts
 * @description A proxy injector used to propagate internal resolution state (like cycle detection stacks)
 * without exposing it to the public API or user factory functions.
 */
var ContextualInjector = /** @class */ (function () {
    function ContextualInjector(parent, stack) {
        this.parent = parent;
        this.stack = stack;
    }
    Object.defineProperty(ContextualInjector.prototype, "destroyed", {
        get: function () { return this.parent.destroyed; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ContextualInjector.prototype, "interceptStrategy", {
        get: function () { return this.parent.interceptStrategy; },
        enumerable: false,
        configurable: true
    });
    ContextualInjector.prototype.get = function (token, flags) { return this.parent.get(token, flags); };
    ContextualInjector.prototype.getAsync = function (token, flags) { return this.parent.getAsync(token, flags, this.stack); };
    ContextualInjector.prototype.set = function (token, provider) { return this.parent.set(token, provider); };
    ContextualInjector.prototype.destroy = function () { };
    return ContextualInjector;
}());
export { ContextualInjector };