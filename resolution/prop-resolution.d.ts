/**
 * @file core/resolution.ts
 * @description Handles the logic for resolving dependencies, including parameter and property injection and transformation.
 */
import { ResolveMode } from '../metadata';
export type TransformProp = (ctx: {
    meta: any;
    value: any;
    target: any;
    key: string;
}) => any;
export declare function resolveParams(deps: any[], args?: any[], mode?: ResolveMode): any[];
export declare function resolveProps(target: any, props: any, mode?: ResolveMode): any;
