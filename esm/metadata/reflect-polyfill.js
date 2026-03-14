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
const store = new WeakMap();
function ensureMap(target, key) {
    let byKey = store.get(target);
    if (!byKey)
        store.set(target, byKey = new Map());
    let byProp = byKey.get(key);
    if (!byProp)
        byKey.set(key, byProp = new Map());
    return byProp;
}
Reflect.metadata = (key, value) => {
    return (target, prop) => {
        ensureMap(target, key).set(prop, value);
    };
};
Reflect.defineMetadata = (key, value, target, prop) => {
    ensureMap(target, key).set(prop, value);
};
Reflect.getMetadata = (key, target, prop) => {
    var _a, _b;
    return (_b = (_a = store.get(target)) === null || _a === void 0 ? void 0 : _a.get(key)) === null || _b === void 0 ? void 0 : _b.get(prop);
};
export {};