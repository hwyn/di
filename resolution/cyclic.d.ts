import { InjectorRecord } from '../registry';
import { TokenKey } from '../metadata';
export declare function guardCyclicDependency<T>(token: TokenKey, record: InjectorRecord<T>, next: () => T): T;
