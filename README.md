# @hwy-fm/di

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)

A lightweight, high-performance, and concurrency-safe Dependency Injection (DI) container for TypeScript and Node.js.

Designed for developers who love **Java Spring / Angular style** dependency injection but want a **module-free**, pure DI experience.

## ✨ Key Features

- **🚀 Concurrency Safe**: Built-in `AsyncLocalStorage` support prevents context pollution in async/concurrent flows (Node.js).
- **⚡️ High Performance**: AOT-like factory compilation and O(1) resolution algorithm.
- **🛠 Zero Boilerplate**: No complex `Module` files or imports/exports. Just `@Injectable`, `@Inject`, and go.
- **✨ Full Async Support**: Supports async factories, async initialization (`method returning Promise`), and mixed sync/async injection chains.
- **🔌 AOP Support**: Lightweight Aspect-Oriented Programming capabilities via `MethodProxy`.

---

## 📦 Installation

```bash
npm install @hwy-fm/di reflect-metadata
```

Make sure to enable decorators in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

## 🚀 Quick Start

### 1. Define Services

Use `@Injectable()` to declare a class as a service.

```typescript
import { Injectable } from '@hwy-fm/di';

@Injectable()
export class LoggerService {
  log(msg: string) {
    console.log(`[LOG]: ${msg}`);
  }
}

@Injectable()
export class UserService {
  // Automatic constructor injection
  constructor(private logger: LoggerService) {}

  getUser() {
    this.logger.log('Fetching user...');
    return { name: 'Alice' };
  }
}
```

### 2. Create Injector & Run

Create a root injector and resolve dependencies.

```typescript
import { Injector } from '@hwy-fm/di';
import { UserService } from './services';

const injector = Injector.create([]); // Root injector

const userService = injector.get(UserService);
const user = userService.getUser(); 
// Output: [LOG]: Fetching user...
```

---

## 💡 Advanced Usage

### 1. Token Binding & Interfaces

Since TypeScript interfaces disappear at runtime, use `InjectorToken` for abstraction.

```typescript
import { InjectorToken, Inject, Injectable } from '@hwy-fm/di';

// Define a Token
export const API_CONFIG = new InjectorToken<string>('API_CONFIG');

@Injectable()
class HttpService {
  constructor(@Inject(API_CONFIG) private apiUrl: string) {}
}

// Bind Value in Injector
const injector = Injector.create([
  { provide: API_CONFIG, useValue: 'https://api.example.com' }
]);
```

### 2. Async Factories & Initialization

The container can handle asynchronous dependencies gracefully.

```typescript
const DB_CONNECTION = new InjectorToken('DB_CONNECTION');

const injector = Injector.create([
  {
    provide: DB_CONNECTION,
    useFactory: async () => {
      const db = await connectToDatabase(); // Async operation
      return db;
    }
  }
]);

// Use 'getAsync' to resolve async chains
const db = await injector.getAsync(DB_CONNECTION);
```

### 3. Multi-Tokens (Plugin Style)

Bind multiple implementations to a single token. Useful for plugins or event listeners.

```typescript
import { InjectorToken, MultiToken, Injectable } from '@hwy-fm/di';

const PLUGIN_TOKEN = new InjectorToken('PLUGIN');

@MultiToken(PLUGIN_TOKEN) // Bind this class to the multi-token
@Injectable()
class AuthPlugin { 
    init() { console.log('Auth Plugin Loaded'); } 
}

@MultiToken(PLUGIN_TOKEN)
@Injectable()
class LoggerPlugin { 
    init() { console.log('Logger Plugin Loaded'); } 
}

const injector = Injector.create([]);

// Resolve all plugins as an array
const plugins = injector.get(PLUGIN_TOKEN); 
plugins.forEach(p => p.init());
```

### 4. Scoping & Resolution Strategies

#### Singleton vs Transient

You can control *where* the service is created and cached using the `providedIn` option.

- **`'root'`** (Default): Singleton. Created once in the root injector and shared everywhere.
- **`'any'`**: Transient-ish. Created in **every** injector that requests it. Useful for isolation.

```typescript
// Shared Singleton
@Injectable() // Defaults to 'root' scope
class SingletonService {}

// New instance per Injector (e.g. per-request if using request-injectors)
@Scope('any')
@Injectable()
class IsolatedService {}
```

#### Property Injection

If you prefer not to clutter your constructor, you can inject properties directly.

*Note: Constructor injection is generally recommended for better testing and immutability.*

```typescript
@Injectable()
class ReportService {
  @Inject(Logger)
  private logger!: Logger; // Property injection

  generate() {
    this.logger.log('Generating report...');
  }
}
```

### 5. Hierarchical Injectors

Injectors can be nested. A child injector can read from its parent, but can also override providers for its own scope. This is useful for component-trees or specific context isolation.

```typescript
class Config { port = 8080 }

const parent = Injector.create([
  { provide: Config, useValue: { port: 8080 } }
]);

const child = Injector.create([
  { provide: Config, useValue: { port: 3000 } } // Override!
], parent);

console.log(parent.get(Config).port); // 8080
console.log(child.get(Config).port);  // 3000
```

### 6. Resolution Modifiers

Control how dependencies are resolved using decorators.

```typescript
import { Optional, SkipSelf, Self } from '@hwy-fm/di';

@Injectable()
class Component {
  constructor(
    // 1. Optional: Don't throw if not found, just return null
    @Optional() private optionalService: SpecialService,

    // 2. SkipSelf: Start looking from the PARENT injector (bypass local)
    @SkipSelf() private parentConfig: Config,

    // 3. Self: Only look in the CURRENT injector (don't look up validity)
    @Self() private localData: LocalData
  ) {}
}
```

### 7. Circular Dependencies

If `ServiceA` depends on `ServiceB` and `ServiceB` depends on `ServiceA`, use `forwardRef`.

```typescript
import { forwardRef, Inject } from '@hwy-fm/di';

@Injectable()
class ServiceA {
  // Use forwardRef to defer resolution of ServiceB
  constructor(@Inject(forwardRef(() => ServiceB)) private b: ServiceB) {}
}

@Injectable()
class ServiceB {
  constructor(@Inject(forwardRef(() => ServiceA)) private a: ServiceA) {}
}
```

### 8. Provider Recipes

Different ways to define providers in `Injector.create([...])`.

```typescript
const providers = [
  // 1. Value Provider: constant values
  { provide: 'API_URL', useValue: 'https://api.com' },

  // 2. Class Provider (Alias): 'Logger' token returns 'ConsoleLogger' instance
  { provide: Logger, useClass: ConsoleLogger },

  // 3. Existing Provider: Reuse an existing instance found by another token
  { provide: 'AliasedLogger', useExisting: Logger },

  // 4. Factory Provider: Dynamic creation with dependencies
  { 
    provide: Database, 
    useFactory: (config: Config) => new Database(config.connectionString),
    deps: [Config] 
  }
];
```

### 9. Private Providers (Encapsulation)

By default, child injectors can resolve dependencies from their parents. You can enforce boundaries by marking a provider as `private: true`. This makes it visible *only* to the injector it is registered in, effectively hiding it from children.

```typescript
const SECRET_TOKEN = new InjectorToken('SECRET');

const parent = Injector.create([
  // This provider is invisible to children
  { provide: SECRET_TOKEN, useValue: 'top-secret', private: true }
]);

const child = Injector.create([], parent);

console.log(parent.get(SECRET_TOKEN)); // 'top-secret'
// child.get(SECRET_TOKEN); // Throws: No provider for SECRET
```

---

## 🔒 Concurrency & Context Isolation (Node.js)

In high-concurrency Node.js applications (e.g., HTTP servers), global state is dangerous. This library uses `AsyncLocalStorage` to isolate dependency scopes per request.

```typescript
import { Injector, runInInjectionContext } from '@hwy-fm/di';
import { Injectable, InjectorToken, Inject } from '@hwy-fm/di';

const REQUEST_ID = new InjectorToken('REQUEST_ID');

@Injectable()
class RequestHandler {
  constructor(@Inject(REQUEST_ID) private id: string) {}
  
  process() {
    console.log(`Processing request: ${this.id}`);
  }
}

// Middleware or Controller
async function handleRequest(req, res) {
  const reqInjector = Injector.create([
    { provide: REQUEST_ID, useValue: req.headers['x-request-id'] }
  ], rootInjector);

  // Run all DI operations within this scope
  await runInInjectionContext(reqInjector, async () => {
     // Even if you await here, context is preserved
     await someAsyncWork();
     
     // Correctly resolves the request-scoped dependencies
     const handler = reqInjector.get(RequestHandler);
     handler.process();
  });
}
```

---

## 🛠 Decorators API

| Decorator | Target | Description |
| :--- | :--- | :--- |
| **`@Injectable(options?)`** | Class | Marks a class as available to the injector. Options: `{ providedIn: 'root' | 'any' }`. |
| **`@Inject(token)`** | Constructor Param | Optimizes injection when Type metadata is insufficient (e.g., Interfaces or primitives). |
| **`@Token(token)`** | Class | Binds a class to a specific `InjectorToken` (Single binding). |
| **`@MultiToken(token)`** | Class | Binds a class to a specific `InjectorToken` (Array binding). |
| **`@Optional()`** | Constructor Param | Does not throw if the dependency is not found; returns `null`. |
| **`@Self()`** | Constructor Param | Only resolves from the local injector, never from the parent. |
| **`@SkipSelf()`** | Constructor Param | Starts resolution from the parent injector. |



---

## 🎣 Lifecycle & Hooks

### 1. Instance Lifecycle Methods

The simplest way to hook into the lifecycle is implementing methods on your service class.

| Method | Description |
| :--- | :--- |
| **`onInit()`** | Called immediately after dependencies are resolved and the instance is created. Can return a `Promise` for async initialization. |
| **`destroy()`** | Called when `injector.destroy()` is invoked. Used for cleanup. |

```typescript
@Injectable()
class DatabaseService {
  async onInit() {
    console.log('Connecting to DB...');
    await this.connect();
    console.log('Connected!'); // System waits for this if using getAsync
  }
  
  destroy() {
    console.log('Closing DB connection...');
    this.disconnect();
  }
}
```

### 2. Advanced Container Hooks

For advanced control (e.g., monitoring, policy enforcement), you can attach hooks to **Tokens** directly using `HookMetadata`. These run at the **container level** during the resolution process.

```typescript
import { HookMetadata, InjectorToken, Injectable, Injector } from '@hwy-fm/di';

const MY_TOKEN = new InjectorToken('RESTRICTED_TOKEN');

// 1. Attach hooks to the token
HookMetadata.hook(MY_TOKEN, {
  // onAllow: Decide if a provider is allowed to be registered or resolved
  // Context is available! You can check parent injector status.
  onAllow: (token, provider, context) => {
    // E.g. block if not in a specific scope structure or based on other services
    return true; 
  },

  // before: Run before instantiation
  before: (token, record, context) => {
    console.time(`Instantiation-${token}`);
  },

  // after: Run after instantiation
  after: (instance, token, context) => {
    console.timeEnd(`Instantiation-${token}`);
    console.log('Created instance:', instance);
  },

  // onError: Handle instantiation errors (e.g., fallback)
  onError: (error, token, context) => {
    console.error('Failed to create:', token);
    return { fallback: 'value' }; // Return backup value
  }
});

@Injectable()
class MyService {}

// Bind it normally
const injector = Injector.create([{ provide: MY_TOKEN, useClass: MyService }]);

// Trigger hooks
injector.get(MY_TOKEN);
```

### 3. Custom Factory Interception

You can completely replace the instantiation logic for a specific token using the `customFactory` hook. This acts as a middleware for object creation, useful for AOP proxies.

```typescript
HookMetadata.hook(UserService, {
  customFactory: (record, next, context) => {
    // context: The current Injector instance
    console.log('Before creation');
    const instance = next(); // Proceed with original factory
    console.log('After creation');
    // You can wrap/proxy the instance here
    return instance;
  }
});
```

---

## 🧪 Testing

Testing is simple: create an injector with mocks for your dependencies.

```typescript
const injector = Injector.create([
  { provide: ApiService, useValue: mockApiService }, // Mock logic
  { provide: UserService, useClass: UserService }    // Real logic
]);

const user = await injector.get(UserService).fetchUser(1);
expect(user.name).toBe('Test User');
```

For isolated unit tests without a full injector, use `resolveMinimal` (or `resolveMinimalAsync`) to act as a temporary sandbox. You can optionally pass a parent injector to provide mocks.

```typescript
// 1. Create mocks
const parent = Injector.create([{ provide: Database, useValue: mockDb }]);

// 2. Resolve target in a standalone sandbox (inheriting mocks)
const [service, cleanup] = resolveMinimal(UserService, parent);

expect(service).toBeDefined();

// 3. Cleanup ephemeral instances
cleanup();
```

---

## 🔌 Extensibility & Framework Integration

This library is designed to be the foundation of larger frameworks. Here are patterns for extending its capabilities.

### 1. Custom Class Decorators (Meta-programming)

You can create semantic decorators (like `@Controller`, `@Repository`) that automatically register classes or attach metadata.

```typescript
import { makeDecorator, setInjectableDef } from '@hwy-fm/di';

// Create a decorator that:
// 1. Takes 'path' metadata
// 2. Automatically marks the class as @Injectable
export const Controller = makeDecorator(
  'Controller',
  (path: string) => ({ path }), 
  (cls, meta) => {
    setInjectableDef(cls, { providedIn: 'root' });
    // Global router registry example
    RouterRegistry.register(meta.path, cls);
  }
);

// Usage
@Controller('/api/users')
class UserController {} 
```

### 2. Custom Parameter Decorators

Create shorthand decorators for specific injection patterns.

```typescript
import { makeParamDecorator, Inject } from '@hwy-fm/di';

const CONFIG = new InjectorToken('APP_CONFIG');

// Create @InjectConfig(key) -> wraps @Inject(CONFIG) + transform
export const InjectConfig = makeParamDecorator(
  'InjectConfig',
  (key: string) => ({ key }),
  (cls, unused, index) => {
    // Manually push injection logic or use existing @Inject under the hood
    // (Advanced implementation omitted for brevity)
  }
);
```

### 3. Data Transformation with Decorators

You can create decorators that transform the injected value before it reaches the constructor. This is powerful for normalizing config or validation.

```typescript
import { makeParamDecorator } from '@hwy-fm/di';

// Create a decorator with a 'transform' function
export const EnvVar = makeParamDecorator(
  'EnvVar',
  (key: string) => ({ 
    token: process.env, // Inject the whole env object
    transform: (value, meta) => value[meta.key] || 'DEFAULT' // Pick and fallback
  })
);

@Injectable()
class ConfigService {
  constructor(@EnvVar('PORT') public port: string) {
    console.log(this.port); // Output: '3000' or 'DEFAULT'
  }
}
```

### 4. Custom Property & Method Decorators

You're not limited to classes and parameters.

```typescript
import { makePropDecorator, makeMethodDecorator } from '@hwy-fm/di';

// Property Decorator
const Value = makePropDecorator('Value', (val: any) => ({ value: val }));

// Method Decorator
const Log = makeMethodDecorator('Log', () => ({}));

class Example {
  @Value(42) 
  count: number;

  @Log()
  save() { /* ... */ }
}
```

### 5. Global Instance Interceptors

Use the `INTERCEPTORS` multi-token to wrap or modify *every* instance created by the container. This is the entry point for implementing global AOP, Profiling, or Proxies.

```typescript
import { INTERCEPTORS, Injector } from '@hwy-fm/di';

const Profiler = (instance: any, token: any) => {
  if (typeof instance.handle === 'function') {
    // A simple proxy pattern
    const original = instance.handle.bind(instance);
    instance.handle = (...args) => {
      console.time(token.name);
      const res = original(...args);
      console.timeEnd(token.name);
      return res;
    };
  }
  return instance;
};

const injector = Injector.create([
  { provide: INTERCEPTORS, useValue: Profiler, multi: true }
]);
```




---

## 🛡 Strict Mode & Policies

For large teams, you can enforce stricter rules to prevent common mistakes (like memory leaks or ambiguous resolutions).

```typescript
import { InstantiationPolicy } from '@hwy-fm/di';

// 1. Strict Async Lifecycle
// Throws if a service has an async `onInit()` but is instantiated by a synchronous chain.
// Prevents use of uninitialized services.
InstantiationPolicy.strictAsyncLifecycle = true; 

// 2. Strict Multi-Injection
// Throws if you try to add a provider to a MultiToken AFTER it has already been resolved.
// Prevents "missing plugin" bugs.
InstantiationPolicy.strictMultiInjection = true;
```

---

## 🍳 Recipes & Patterns

### 1. Lazy Loading / Code Splitting

You can delay loading heavy dependencies (like massive PDF libraries) until they are actually needed using async factories and dynamic imports.

```typescript
const PDF_SERVICE = new InjectorToken('PDF_SERVICE');

const injector = Injector.create([
  {
    provide: PDF_SERVICE,
    useFactory: async () => {
      // Only downloads/loads the file when getAsync is called
      const { PdfServiceImpl } = await import('./services/heavy-pdf.service');
      return new PdfServiceImpl();
    }
  }
]);

// ... later in your code
const pdfService = await injector.getAsync(PDF_SERVICE);
```

### 2. Express.js Middleware Integration

Here is a drop-in middleware pattern for Express apps to ensure every request has its own isolated DI scope.

```typescript
import { Injector, runInInjectionContext, Inject, Injectable, InjectorToken } from '@hwy-fm/di';

// Context Tokens
const REQ = new InjectorToken('EXPRESS_REQ');
const RES = new InjectorToken('EXPRESS_RES');

// Middleware
export const diMiddleware = (rootInjector: Injector) => {
  return (req, res, next) => {
    // 1. Create a child injector for this request
    const reqInjector = Injector.create([
      { provide: REQ, useValue: req },
      { provide: RES, useValue: res }
    ], rootInjector);

    // 2. Run the rest of the request chain inside the DI context
    runInInjectionContext(reqInjector, async () => {
      // Create a transient instance of controller for THIS request
      // Note: Controller must be provided in 'any' scope or manually resolved from reqInjector
      const controller = reqInjector.get(UserController);
      await controller.handle(req, res);
    });
  };
};

// Usage with Controller
// IMPORTANT: '@Scope('any')' ensures a new instance is created for every request (Injector)
@Scope('any')
@Injectable() 
class UserController {
  constructor(@Inject(REQ) private req: any) {}
  
  async handle(req, res) {
    res.json({ user: this.req.user, id: this.req.id });
  }
}
```

### 3. Client-Side (React) Integration

Use the DI container to manage business logic and state outside of your React components (ViewModel pattern).

**1. Create a `useService` Hook**

```typescript
import React, { useContext, useMemo, createContext } from 'react';
import { Injector, Type } from '@hwy-fm/di';

// --- Integration Layer ---

const DIContext = createContext<Injector | null>(null);

export const DIProvider = ({ providers, children }: { providers: any[], children: any }) => {
  // Create the injector only once
  const injector = useMemo(() => Injector.create(providers), []);
  
  return <DIContext.Provider value={injector}>{children}</DIContext.Provider>;
};

export function useService<T>(token: Type<T> | any): T {
  const injector = useContext(DIContext);
  if (!injector) throw new Error('Injector not found. Wrap your app in <DIProvider>');
  return injector.get(token);
}

// Optional: HOC for class components
export function withService<T>(token: Type<T>, propName: string = 'service') {
  return (Component: any) => (props: any) => {
    const service = useService(token);
    return <Component {...props} {...{ [propName]: service }} />;
  };
}
```

**2. Use in Components**

Move logic out of `useEffect` and into Services.

```typescript
// --- Business Logic (Framework Agnostic) ---
@Injectable()
class CounterService {
  count = 0; // Or use MobX/RxJS here
  
  increment() { 
     this.count++;
     // emit change event...
  }
}

// --- View Layer (React) ---
const App = () => (
  // Root of the specific feature module
  <DIProvider providers={[{ provide: CounterService, useClass: CounterService }]}>
    <Counter />
  </DIProvider>
);

const Counter = () => {
  const service = useService(CounterService); // Dependency Injection!
  
  return (
    <button onClick={() => service.increment()}>
      Action from Service
    </button>
  );
};
```

### 4. Conditional Registration

#### A. Static Environment (Process Env)

For static conditions (like `NODE_ENV`) where no injector context is needed, use `onAllow`.

```typescript
HookMetadata.hook(DEV_TOOLS, {
  // Although context is passed, we might not need it for simple env checks
  onAllow: () => process.env.NODE_ENV === 'development'
});
```

#### B. Context-Aware Conditions

Since `onAllow` receives the `Injector` context, you can now check conditions based on the injector state or parent hierarchy.

```typescript
HookMetadata.hook(MY_FEATURE, {
  onAllow: (token, provider, injector) => {
    // Only allow if we are inside a child injector (have a parent)
    return !!injector.parent;
  }
});
```

#### C. Configuration-Based (Runtime Factory)

If your condition depends on a *resolved service* (like a loaded Config object), use a **Factory Provider**.

```typescript
@Injectable()
class ConfigService {
  features = { enableNewUI: true }; // Loaded from config.json
}

const FEATURE_SERVICE = new InjectorToken('FEATURE_SERVICE');

const injector = Injector.create([
  { provide: ConfigService, useClass: ConfigService },
  {
    provide: FEATURE_SERVICE,
    // The factory can access ConfigService to make decisions
    useFactory: (config: ConfigService) => {
      if (config.features.enableNewUI) {
        return new NewUIService();
      }
      return new LegacyUIService();
    },
    deps: [ConfigService]
  }
]);
```

### 5. Global Content Registry

`TokenRegistry` is a high-performance global store for collecting data, configurations, or plugin points. It is useful for implementing "Contribution Points" (like VS Code extensions) where different parts of the app contribute to a central list.

```typescript
import { TokenRegistry } from '@hwy-fm/di';

// 1. Define a Scope (e.g., a Menu System)
const MENU_ITEMS = TokenRegistry.createScope<MenuItem>('MENU_ITEMS', { multi: true });

interface MenuItem { label: string; action: string; }

// 2. Register items from anywhere (no injector needed)
TokenRegistry.register(MENU_ITEMS, { label: 'File', action: 'open' });
TokenRegistry.register(MENU_ITEMS, [
  { label: 'Edit', action: 'copy' },
  { label: 'View', action: 'zoom' }
]);

// 3. Retrieve them later (Result is cached and frozen)
const items = TokenRegistry.getAll(MENU_ITEMS);
console.log(items); 
// Output: [{label: 'File'...}, {label: 'Edit'...}, {label: 'View'...}]
```

### 6. Event Bus Pattern (Decoupled Communication)

Use `MultiToken` to create a decentralized event bus where modules register handlers without centralized coupling.

```typescript
import { InjectorToken, MultiToken, Inject, Injectable } from '@hwy-fm/di';

interface EventHandler {
  type: string;
  handle(payload: any): void;
}
const EVENT_HANDLERS = new InjectorToken<EventHandler>('EVENT_HANDLERS');

@Injectable()
class EventBus {
  private handlersMap = new Map<string, EventHandler[]>();

  constructor(@Inject(EVENT_HANDLERS) handlers: EventHandler[]) {
    handlers.forEach(h => {
      const list = this.handlersMap.get(h.type) || [];
      list.push(h);
      this.handlersMap.set(h.type, list);
    });
  }

  emit(type: string, payload: any) {
    this.handlersMap.get(type)?.forEach(h => h.handle(payload));
  }
}

// Plugin: Register a handler
@MultiToken(EVENT_HANDLERS)
@Injectable()
class UserCreatedHandler implements EventHandler {
  type = 'USER_CREATED';
  handle(user: any) { console.log('Welcome', user.name); }
}
```

### 7. Assisted Injection (Runtime Arguments)

Combine DI with runtime arguments by injecting a **Factory Function**.

```typescript
type UserSessionFactory = (userId: string) => UserSession;
const USER_SESSION_FACTORY = new InjectorToken<UserSessionFactory>('USER_SESSION_FACTORY');

class UserSession {
  constructor(private db: Database, private userId: string) {}
}

const providers = [
  {
    provide: USER_SESSION_FACTORY,
    // Inject 'Database' from DI, return function accepting 'userId'
    useFactory: (db: Database) => (userId: string) => new UserSession(db, userId),
    deps: [Database]
  }
];

@Injectable()
class LoginController {
  constructor(@Inject(USER_SESSION_FACTORY) private createSession: UserSessionFactory) {}

  login(id: string) {
    const session = this.createSession(id); // DI + Runtime args
  }
}
```

### 8. Service Fallback (Resiliency)

Use `HookMetadata.onError` to automatically degrade gracefully when a service fails to initialize (e.g. network error).

```typescript
import { HookMetadata } from '@hwy-fm/di';

HookMetadata.hook(RemoteConfigService, {
  onError: (error) => {
    console.warn('RemoteConfig failed, using defaults.', error);
    // Return a fallback value instead of throwing
    return { fallback: new DefaultConfigService() };
  }
});
```

### 9. Smart Context Logger

Combine `AsyncLocalStorage` isolation with DI to create context-aware loggers that don't require passing `RequestID` manually.

```typescript
const REQUEST_CONTEXT = new InjectorToken('REQ_CTX'); // { traceId: string }

@Injectable()
class Logger {
  constructor(@Inject(REQUEST_CONTEXT) @Optional() private ctx: any) {}
  
  info(msg: string) {
    const traceId = this.ctx?.traceId || 'SYSTEM';
    console.log(`[${traceId}] ${msg}`);
  }
}

// In your request middleware:
// Injector.create([{ provide: REQUEST_CONTEXT, useValue: { traceId: '123' } }], root);
```

### 10. System Bootstrapping (Pre-Initialization)

Use `resolveMinimal` as a bootstrapper to load configuration *before* creating the main application injector. This allows you to dynamically shape the providers based on runtime configuration.

```typescript
import { resolveMinimalAsync, Injector } from '@hwy-fm/di';

@Injectable()
class ConfigLoader {
  async load() {
    // Imagine fetching from a remote config server or reading .env
    return { dbType: process.env.DB_TYPE || 'sql', debug: true };
  }
}

async function bootstrap() {
  // 1. Use a temporary sandbox to resolve the loader
  // This creates a ConfigLoader instance, runs it, and essentially throws it away
  const [loader, cleanup] = await resolveMinimalAsync(ConfigLoader);
  
  const config = await loader.load();
  
  // Clean up the temporary sandbox immediately
  await cleanup(); 

  // 2. Define providers dynamically based on the loaded config
  const providers = [
    { provide: 'APP_CONFIG', useValue: config },
    config.dbType === 'sql' ? SqlDatabaseProvider : MongoDatabaseProvider
  ];

  // 3. Create the real, long-lived application injector
  const appInjector = Injector.create(providers);
  appInjector.get(Application).run();
}
```

### 11. Virtual Modules (Zero-Boilerplate Grouping)

You don't need complex `Module` classes to organize your code. Just export arrays of providers! This keeps your code flexible and tree-shakeable.

```typescript
// features/auth/providers.ts
export const AUTH_PROVIDERS = [
  AuthService,
  JwtStrategy,
  { provide: 'AUTH_TIMEOUT', useValue: 3000 }
];

// features/db/providers.ts
export const DB_PROVIDERS = [
  DbConnection,
  UserRepository
];

// app.ts
const appInjector = Injector.create([
  ...AUTH_PROVIDERS, // Spread syntax composes features
  ...DB_PROVIDERS,
  AppService
]);
```

### 12. Isomorphic / Cross-Platform Architecture

Write your business logic once, run it anywhere (Browser, Server, Electron). Abstract platform-specific APIs behind tokens.

```typescript
// 1. Definition (Interface + Token)
interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, val: string): void;
}
export const STORAGE = new InjectorToken<Storage>('STORAGE');

// 2. Business Logic (Platform Agnostic)
@Injectable()
class AuthService {
  constructor(@Inject(STORAGE) private storage: Storage) {}
  
  getToken() { return this.storage.getItem('jwt'); }
}

// 3. Browser Entry
Injector.create([
  { provide: STORAGE, useValue: localStorage } // Wrapper needed for type safety
]);

// 4. Server Entry (Node.js)
class InMemoryStorage implements Storage { /* ... */ }
Injector.create([
  { provide: STORAGE, useClass: InMemoryStorage }
]);
```

### 13. Migration Strategies (The Strangler Pattern)

Migrating legacy services? Use aliasing to point old dependencies to new implementations without rewriting every file.

```typescript
@Injectable()
class OldLogger { /* ... legacy code ... */ }

@Injectable()
class NewKibanaLogger { /* ... modern code ... */ }

const injector = Injector.create([
  // Register the new service
  NewKibanaLogger,
  
  // Point the old token to the new implementation
  // Any component asking for 'OldLogger' gets 'NewKibanaLogger' instance
  { provide: OldLogger, useExisting: NewKibanaLogger }
]);
```

### 14. Hot-Swappable Configuration (Live Updates)

Use a `Proxy` in your factory to creating "live" config objects that react to changes without restarting the application.

```typescript
const APP_CONFIG = new InjectorToken('APP_CONFIG');
let runtimeConfig = { theme: 'dark' };

const injector = Injector.create([
  {
    provide: APP_CONFIG,
    useFactory: () => new Proxy({}, {
      get: (_, prop) => runtimeConfig[prop] // Always reads latest value
    })
  }
]);

const config = injector.get(APP_CONFIG);
console.log(config.theme); // 'dark'

runtimeConfig.theme = 'light';
console.log(config.theme); // 'light' (Updated automatically)
```

### 15. Request-Scoped Caching

Leverage `providedIn: 'any'` and `runInInjectionContext` to create a cache that lives only as long as the HTTP request.

```typescript
@Scope('any') // Created new for every Injector (Request)
@Injectable()
class RequestQueryCache {
  private cache = new Map();

  get(query: string) { return this.cache.get(query); }
  set(query: string, result: any) { this.cache.set(query, result); }
}

// In your service
@Injectable()
class SearchService {
  constructor(private cache: RequestQueryCache) {}

  async search(query: string) {
    if (this.cache.get(query)) return this.cache.get(query);
    
    const result = await db.find(query);
    this.cache.set(query, result); // Cached only for this request!
    return result;
  }
}
```

### 16. Method Parameter Injection (Experimental)

Use the built-in `MethodProxy` to enable dependency injection directly into method arguments, not just constructors.

```typescript
import { MethodProxy } from '@hwy-fm/di';

@Injectable()
class CommandHandler {
  // 1. Define method with dependencies
  run(@Inject(User) user?: User, @Inject(Config) config?: Config) {
    console.log(`Running for ${user.name}`);
  }
}

// 2. Wire it up (e.g. via an Interceptor or Helper)
HookMetadata.hook(CommandHandler, {
  after: (instance, token, injector) => {
    // Automatically wraps methods to inject parameters from the injector
    injector.get(MethodProxy).proxyMethod(instance, 'run');
    return instance;
  }
});
```

---

## 🐞 Troubleshooting

If injection isn't working as expected, you can enable verbose internal logging.

```typescript
import { DEBUG_MODE } from '@hwy-fm/di';

// Enable detailed logs for resolution, instantiation, and context switches
DEBUG_MODE.enabled = true;
```

---

## ⚡️ Performance & Architecture

This library is engineered for speed and low memory footprint.

- **Pre-compiled Factories**: Unlike many reflection-heavy libraries, dependency resolution logic is compiled into a closure factory upon first access (`strategy.ts`). Subsequent access is practically just a function call.
- **O(1) Resolution**: Using `Map`-based registries ensures constant time complexity for dependency lookups, regardless of graph size.
- **No Class Scanning**: We do not scan the file system. You explicitly control what gets loaded by what you pass to `Injector.create([...])` or what strict dependencies you request.

## 📄 License

MIT © 2024
