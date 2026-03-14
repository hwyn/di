"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipSelf = exports.Self = exports.Optional = exports.Inject = exports.Injectable = exports.setInjectableDef = void 0;
var tslib_1 = require("tslib");
var constants_1 = require("./constants");
var decorators_1 = require("./decorators");
var metadata_keys_1 = require("./metadata-keys");
var common_1 = require("../common");
/**
 * Manually registers an Injectable definition for a token.
 *
 * This is the programmatic equivalent of applying `@Injectable()` to a class.
 * The definition includes scope, factory configuration, and environment tagging.
 * Typically used in decorator `typeFn` callbacks or when registering non-class tokens.
 *
 * @typeParam S - Scope type (defaults to {@link ScopeId}).
 * @param type - The injection token to register.
 * @param opt - Optional scope and provider configuration.
 * @returns The token with the definition attached.
 *
 * @example
 * ```ts
 * setInjectableDef(MyService);                       // root scope, auto-resolve
 * setInjectableDef(MY_TOKEN, { scope: 'request' });  // scoped token
 * ```
 */
var setInjectableDef = function (type, opt) {
    var _a;
    var scope = (_a = opt === null || opt === void 0 ? void 0 : opt.scope) !== null && _a !== void 0 ? _a : constants_1.ROOT_SCOPE;
    var def = { token: type, scope: scope, opt: opt };
    if (common_1.InstantiationPolicy.activeEnv) {
        def.env = common_1.InstantiationPolicy.activeEnv;
    }
    return (0, metadata_keys_1.setInjectableDef)(type, def);
};
exports.setInjectableDef = setInjectableDef;
/**
 * Class decorator that marks a class as available for dependency injection.
 *
 * The DI system can then automatically resolve and instantiate this class when requested.
 * By default, the class is registered in the `'root'` scope.
 *
 * @param opt - Optional configuration for scope and provider settings.
 *
 * @example
 * ```ts
 * @Injectable()
 * class UserService {
 *   constructor(private repo: UserRepository) {}
 * }
 *
 * @Injectable({ scope: 'request' })
 * class RequestContext { ... }
 * ```
 */
exports.Injectable = (0, decorators_1.makeDecorator)('Injectable', function (opt) { return opt; }, function (target, _a) {
    var args = _a.args;
    return exports.setInjectableDef.apply(void 0, tslib_1.__spreadArray([target], tslib_1.__read(args), false));
});
var resolveToken = function (token, opt) { return (tslib_1.__assign(tslib_1.__assign({}, opt), { token: token })); };
/**
 * Parameter / property decorator that specifies the injection token to resolve.
 *
 * When applied to a constructor parameter, the DI system resolves the specified
 * token instead of using the parameter's TypeScript type.
 * When applied to a property, the value is automatically injected after construction.
 *
 * The optional second argument `opt` is spread into the annotation metadata
 * (`{ ...opt, token }`), allowing higher-level frameworks to read extension
 * properties for custom logic.
 *
 * @param token - The injection token to resolve.
 * @param opt - Optional extension metadata object; properties are merged into the annotation.
 *
 * @example
 * ```ts
 * @Injectable()
 * class OrderService {
 *   // Constructor parameter injection
 *   constructor(@Inject(CONFIG_TOKEN) private config: AppConfig) {}
 *
 *   // Property injection
 *   @Inject(Logger) logger!: Logger;
 * }
 * ```
 */
exports.Inject = (0, decorators_1.markInject)((0, decorators_1.makeParamDecorator)('Inject', resolveToken), constants_1.DecoratorFlags.Inject);
/**
 * Parameter decorator that marks a dependency as optional.
 *
 * If the token cannot be resolved (no provider found), the injector returns `null`
 * instead of throwing an error.
 *
 * @example
 * ```ts
 * @Injectable()
 * class NotificationService {
 *   constructor(@Optional() @Inject(EmailService) private email: EmailService | null) {
 *     // email is null if EmailService is not registered
 *   }
 * }
 * ```
 */
exports.Optional = (0, decorators_1.markInject)((0, decorators_1.makeParamDecorator)('Optional'), constants_1.InjectFlags.Optional);
/**
 * Parameter decorator that restricts resolution to the current injector only.
 *
 * The injector will NOT look up the parent chain. If the token is not found
 * in the current injector, resolution fails (or returns `null` if combined with `@Optional()`).
 *
 * @example
 * ```ts
 * constructor(@Self() @Inject(LocalConfig) config: LocalConfig) {}
 * ```
 */
exports.Self = (0, decorators_1.markInject)((0, decorators_1.makeParamDecorator)('Self'), constants_1.InjectFlags.Self);
/**
 * Parameter decorator that skips the current injector and resolves from the parent.
 *
 * Useful when a child injector overrides a token but the class needs the parent's version.
 *
 * @example
 * ```ts
 * constructor(@SkipSelf() @Inject(Logger) parentLogger: Logger) {}
 * ```
 */
exports.SkipSelf = (0, decorators_1.markInject)((0, decorators_1.makeParamDecorator)('SkipSelf'), constants_1.InjectFlags.SkipSelf);