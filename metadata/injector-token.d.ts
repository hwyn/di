/**
 * @file meta/token.ts
 * @description Defines the Identity (Token) used for dependency lookup.
 */
export declare class InjectorToken {
    protected _desc: string;
    static get(_desc: string): InjectorToken;
    constructor(_desc: string);
    toString(): string;
}
