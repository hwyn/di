/**
 * @file meta/injectable.ts
 * @description Defines the @Injectable and @Inject decorators and relevant configuration options.
 */
import { DecoratorFlags, ROOT_SCOPE } from "./constants.js";
import { makeDecorator, makeParamDecorator, markInject } from "./decorators.js";
import { setInjectableDef as _setInjectableDef } from "./metadata-keys.js";
export const setInjectableDef = (type, opt) => {
    const { providedIn = ROOT_SCOPE } = (opt || {});
    const def = { token: type, providedIn, opt };
    return _setInjectableDef(type, def);
};
export const Injectable = makeDecorator('Injectable', (opt) => opt, setInjectableDef);
const resolveToken = (token, opt) => (Object.assign(Object.assign({}, opt), { token }));
export const Inject = markInject(makeParamDecorator('Inject', resolveToken), DecoratorFlags.Inject);
export const Optional = markInject(makeParamDecorator('Optional'), 1 /* InjectFlags.Optional */);
export const Self = markInject(makeParamDecorator('Self'), 2 /* InjectFlags.Self */);
export const SkipSelf = markInject(makeParamDecorator('SkipSelf'), 4 /* InjectFlags.SkipSelf */);
