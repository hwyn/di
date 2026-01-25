/**
 * @file core/resolution.ts
 * @description Handles the logic for resolving dependencies, including parameter and property injection and transformation.
 */
export declare enum ResolveMode {
    Sync = 0,
    Async = 1
}
export declare function resolveParams(deps: any[], args?: any[], mode?: ResolveMode): any[];
export type TransformProp = (meta: any, value: any, target: any, key: string) => any;
export declare function resolveProps(target: any, props: any, mode?: ResolveMode): any;
