/**
 * @file meta/token.ts
 * @description Defines the Identity (Token) used for dependency lookup.
 */
export class InjectorToken {
    static get(_desc) {
        return new InjectorToken(_desc);
    }
    constructor(_desc) {
        this._desc = _desc;
    }
    toString() {
        return `Token ${this._desc}`;
    }
}
