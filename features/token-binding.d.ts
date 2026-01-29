/**
 * @file token-binding.ts
 * @description Dependency Injection Token Binding System
 *
 * Manages the registration and resolution strategies for DI Tokens.
 * Implements a "Smart Factory" pattern that:
 * 1. Supports both Single and Multi-provider bindings
 * 2. Handles Scope-based filtering (Root vs Component scopes)
 * 3. Adapts to Sync and Async resolution modes automatically
 * 4. Provides high-performance lookups using WeakMaps and closure caching
 */
import { InjectorToken, Type, Provider } from '../metadata';
export declare function register(input: Provider | Provider[], scope?: string, isDecorator?: boolean): void;
export declare function Token(token: InjectorToken, scope?: string): (target: Type<any>) => void;
export declare function MultiToken(token: InjectorToken, scope?: string): (target: Type<any>) => void;
