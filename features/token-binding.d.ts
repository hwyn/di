import { InjectorToken, Type, Provider } from '../metadata';
/**
 * Programmatically registers one or more providers into the token-binding system.
 *
 * This is the imperative counterpart to `@Token()` / `@MultiToken()` decorators.
 * Registered providers are resolved lazily when the token is first requested from
 * an injector whose scope matches.
 *
 * @param input - A provider or array of providers to register.
 * @param scope - Scope for the registration (defaults to `'root'`).
 * @param isDecorator - @internal Whether this call originates from a decorator (affects warnings).
 *
 * @example
 * ```ts
 * register({ provide: API_TOKEN, useValue: '/api/v2' });
 * register([
 *   { provide: PLUGIN, multi: true, useClass: AuthPlugin },
 *   { provide: PLUGIN, multi: true, useClass: LogPlugin },
 * ], 'root');
 * ```
 */
export declare function register(input: Provider | Provider[], scope?: string, isDecorator?: boolean): void;
/**
 * Class decorator that binds a class to an `InjectorToken` as a single-value provider.
 *
 * When the token is resolved, the DI system returns this class's instance.
 * If another class also decorates with the same token, the later one overwrites
 * (with a dev-mode warning).
 *
 * @param token - The InjectorToken to bind to.
 * @param scope - Scope for the binding (defaults to `'root'`).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * const CACHE = InjectorToken.get<CacheService>('CACHE');
 *
 * @Token(CACHE)
 * @Injectable()
 * class RedisCacheService implements CacheService { ... }
 * ```
 */
export declare function Token(token: InjectorToken, scope?: string): (target: Type<any>) => void;
/**
 * Class decorator that binds a class to an `InjectorToken` as a multi-value provider.
 *
 * Multiple classes can bind to the same token; resolving yields an array of all
 * registered implementations (scoped to the current injector's scope).
 *
 * @param token - The InjectorToken to bind to.
 * @param scope - Scope for the binding (defaults to `'root'`).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * const PLUGINS = InjectorToken.get<Plugin[]>('PLUGINS');
 *
 * @MultiToken(PLUGINS)
 * @Injectable()
 * class AuthPlugin implements Plugin { ... }
 *
 * @MultiToken(PLUGINS)
 * @Injectable()
 * class LogPlugin implements Plugin { ... }
 *
 * // Resolving PLUGINS returns [AuthPlugin, LogPlugin]
 * ```
 */
export declare function MultiToken(token: InjectorToken, scope?: string): (target: Type<any>) => void;
