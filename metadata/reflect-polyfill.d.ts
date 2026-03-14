/**
 * Minimal reflect-metadata polyfill.
 *
 * Replaces the `reflect-metadata` npm package (~50 KB) with a ~20-line implementation
 * that covers the only three methods the DI system needs:
 *
 * - `Reflect.metadata(key, value)` — called by TypeScript's `__metadata` helper
 *   (emitted when `emitDecoratorMetadata` is enabled). Returns a decorator function.
 * - `Reflect.defineMetadata(key, value, target, propertyKey?)` — stores metadata directly.
 * - `Reflect.getMetadata(key, target, propertyKey?)` — called by `Reflector` to
 *   read `design:paramtypes` and `design:type`.
 */
declare global {
    namespace Reflect {
        function metadata(key: string, value: unknown): (target: object, prop?: unknown) => void;
        function defineMetadata(key: string, value: unknown, target: object, prop?: unknown): void;
        function getMetadata(key: string, target: object, prop?: unknown): unknown;
    }
}
export {};
