/**
 * @file meta/injectable.ts
 * @description Defines the @Injectable and @Inject decorators and relevant configuration options.
 */
import { DecoratorFlags, InjectFlags, ROOT_SCOPE } from "./constants.js";
import { makeDecorator, makeParamDecorator, markInject } from "./decorators.js";
import { setInjectableDef as _setInjectableDef } from "./metadata-keys.js";
import { InstantiationPolicy } from "../common/index.js";
export const setInjectableDef = (type, opt) => {
    const { scope = ROOT_SCOPE } = (opt || {});
    const def = { token: type, scope, opt };
    if (InstantiationPolicy.activeEnv) {
        def.env = InstantiationPolicy.activeEnv;
    }
    return _setInjectableDef(type, def);
};
export const Injectable = makeDecorator('Injectable', (opt) => opt, (target, { args }) => setInjectableDef(target, ...args));
const resolveToken = (token, opt) => (Object.assign(Object.assign({}, opt), { token }));
export const Inject = markInject(makeParamDecorator('Inject', resolveToken), DecoratorFlags.Inject);
export const Optional = markInject(makeParamDecorator('Optional'), InjectFlags.Optional);
export const Self = markInject(makeParamDecorator('Self'), InjectFlags.Self);
export const SkipSelf = markInject(makeParamDecorator('SkipSelf'), InjectFlags.SkipSelf);