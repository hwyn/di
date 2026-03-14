/**
 * Type-safe injection token for non-class dependencies.
 *
 * Use `InjectorToken` when the injection target is not a class (e.g. a string, number,
 * interface, or configuration object). Each token is unique by reference, and the
 * generic parameter `T` provides type-safety when resolving.
 *
 * Create tokens with the static `InjectorToken.get<T>(description)` factory.
 *
 * @typeParam T - The type of value this token represents.
 *
 * @example
 * ```ts
 * // Define tokens
 * const API_URL = InjectorToken.get<string>('API_URL');
 * const APP_CONFIG = InjectorToken.get<AppConfig>('APP_CONFIG');
 *
 * // Register
 * Injector.create([
 *   { provide: API_URL, useValue: 'https://api.example.com' },
 *   { provide: APP_CONFIG, useFactory: () => loadConfig() },
 * ]);
 *
 * // Resolve (type-safe)
 * const url: string = injector.get(API_URL);
 * ```
 */
var InjectorToken = /** @class */ (function () {
    function InjectorToken(_desc) {
        this._desc = _desc;
    }
    /**
     * Creates a new type-safe injection token.
     *
     * @typeParam T - The type of value this token will hold.
     * @param _desc - A human-readable description for debugging (appears in error messages).
     * @returns A new unique `InjectorToken<T>` instance.
     */
    InjectorToken.get = function (_desc) {
        return new InjectorToken(_desc);
    };
    InjectorToken.prototype.toString = function () {
        return "Token ".concat(this._desc);
    };
    return InjectorToken;
}());
export { InjectorToken };