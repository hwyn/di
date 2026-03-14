import { ScopeId, Provider, TokenKey } from './provider';
/**
 * Options for the `@Injectable()` decorator.
 *
 * Supports two forms:
 * - `{ scope: 'root' }` — Only specify the scope.
 * - Full provider config (e.g. `{ useFactory: ..., scope: 'root' }`) — Advanced provider overrides.
 *
 * @typeParam S - Scope type (defaults to {@link ScopeId}).
 *
 * @example
 * ```ts
 * @Injectable()                          // default: root scope
 * @Injectable({ scope: 'request' })     // scoped to request injectors
 * @Injectable({ useFactory: () => new MyService(), scope: 'root' })
 * ```
 */
export type InjectableOptions<S = ScopeId> = (Provider & {
    scope?: S;
}) | {
    scope?: S;
};
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
export declare const setInjectableDef: <S = ScopeId>(type: TokenKey, opt?: InjectableOptions<S>) => any;
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
export declare const Injectable: (opt?: InjectableOptions<ScopeId>) => import("./decorators").ClassDecorator<any>;
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
export declare const Inject: (token: TokenKey, opt?: object) => import("./decorators").TargetDecorator;
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
export declare const Optional: () => import("./decorators").TargetDecorator;
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
export declare const Self: () => import("./decorators").TargetDecorator;
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
export declare const SkipSelf: () => import("./decorators").TargetDecorator;
