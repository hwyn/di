# @hwy-fm/di

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)

A lightweight, high-performance, and concurrency-safe Dependency Injection (DI) container for TypeScript and Node.js.

Designed for developers who love **Java Spring / Angular style** dependency injection but want a **module-free**, pure DI experience.

## ✨ Key Capabilities (Highlights)

### 1. 🛡️ Environment Awareness & Isolation

The DI system uses a **Two-Phase Isolation Strategy** (Tagging vs. Filtering) to manage services across different environments (e.g., Micro-Frontends, Dev/Prod).

#### Phase 1: Tagging (Global)
You label services with an environment tag (`env`). This can be done manually per provider or valid automatically for a whole bundle.

**Auto-Tagging (Micro-Frontends):**
By setting `InstantiationPolicy.activeEnv` *synchronously* before importing a module, all services defined in that module will be "stamped" with that environment tag.

> **⚠️ Warning:** `InstantiationPolicy.activeEnv` is a **global mutable state**.
> Ensure module loading is synchronous or properly guarded. If you use async imports with `await`, be careful that other concurrent imports don't overwrite this value before your module finishes defining its services.

```typescript
import { InstantiationPolicy } from '@hwy-fm/di';

// 1. Start Tagging
InstantiationPolicy.activeEnv = 'marketing-app';

// 2. Load Module (All @Injectable() inside will get env='marketing-app')
// NOTE: Ensure this executes before changing activeEnv back
const { MarketingModule } = await import('./marketing/module'); 

// 3. Stop Tagging
InstantiationPolicy.activeEnv = null;     
```

#### Phase 2: Filtering (Per-Injector)
You define an **Admission Policy** to decide which tags are allowed in a specific Injector.

**A. Define the Policy:**
```typescript
import { InstantiationPolicy, INJECTOR_ENV, InjectFlags } from '@hwy-fm/di';

// Compare Provider's Tag vs Injector's Context
InstantiationPolicy.globalAdmission = (token, provider, injector) => {
  const allowedEnv = injector.get(INJECTOR_ENV, InjectFlags.Optional | InjectFlags.Self);
  const targetEnv = (provider as any).env;

  if (!allowedEnv) return true; // No restriction
  if (!targetEnv) return true;  // Shared/Common service

  return targetEnv === allowedEnv;
};
```

**B. Create the Injector:**
Bind `INJECTOR_ENV` to enforce the context.

> **Tip:** Bind `INJECTOR_ENV` in your **Root Injector**. Since child injectors inherit configuration, this effectively sets the strategy for the entire application.

```typescript
import { Injector, INJECTOR_ENV, INJECTOR_SCOPE, ROOT_SCOPE } from '@hwy-fm/di';

const rootInjector = Injector.create([
  { provide: INJECTOR_SCOPE, useValue: ROOT_SCOPE },
  { provide: INJECTOR_ENV, useValue: 'marketing-app' }, // Applies to this injector AND all children
  ...MarketingModule.providers
]);
```

### 2. 🚀 Async Governance (Transactional Rollback)

The DI engine treats complex dependency graphs as **transactions**.

- **Automatic Rollback**: If you resolve a tree of async services (A -> B -> C), and 'C' fails to initialize, the engine automatically **disposes** of the successfully created 'B' instance.
- **Shared Protection**: Singletons reused from parent injectors or `useExisting` are protected from accidental disposal during rollback.

```typescript
@Injectable()
class Connection {
  // If this fails...
  async onInit() { 
    throw new Error('Connection failed'); 
  }
}

@Injectable()
class Service {
  // This service (already created) will be automatically destroyed
  constructor(private info: InfoService) {}
}

const injector = Injector.create([Connection, Service, InfoService]);
// The entire resolution fails, and InfoService is safely disposed.
try {
  await injector.getAsync(Connection);
} catch (e) {
  // Rollback complete
}
```

### 3. 🪝 The "Open Kernel" (Metadata Hooks)

A powerful metaprogramming API that lets you intercept and rewrite the DI engine's internal behavior for specific tokens.

```typescript
import { HookMetadata } from '@hwy-fm/di';

// Intercept creation logic (AOP / Mocking)
HookMetadata.hook(MyService, {
  customFactory: (record, next) => {
    console.log('Intercepting creation...');
    return next(); 
  },
  // Dynamic Scoping Control
  onScopeCheck: (def, scope) => scope === 'root'
});
```

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

## 📚 Core Concepts

### 1. Basic Usage

```typescript
import { Injectable, Inject, Injector, INJECTOR_SCOPE, ROOT_SCOPE } from '@hwy-fm/di';

// 1. Define
@Injectable()
class ConfigService {
  apiUrl = 'https://api.com';
}

@Injectable()
class UserService {
  // 2. Inject (Constructor Injection)
  constructor(private config: ConfigService) {}

  getUrl() { return this.config.apiUrl; }
}

// 3. Create Injector (Must bind ROOT_SCOPE for global services)
const injector = Injector.create([
  { provide: INJECTOR_SCOPE, useValue: ROOT_SCOPE }
]);

// 4. Resolve
const user = injector.get(UserService);
```

### 2. Provider Recipes

```typescript
const providers = [
  // Class Provider (Standard)
  { provide: Logger, useClass: ConsoleLogger },

  // Value Provider (Config/Constants)
  { provide: 'API_URL', useValue: 'https://api.com' },

  // Factory Provider (Dynamic Creation)
  { 
    provide: Database, 
    useFactory: (cfg: Config) => new Database(cfg.host),
    deps: [Config] 
  },

  // Existing Provider (Aliasing)
  { provide: 'AliasedLogger', useExisting: Logger }
];
```

### 3. Tokens & Interfaces

Since TypeScript interfaces are erased at runtime, use `InjectorToken`.

```typescript
export const API_CONFIG = new InjectorToken<AppConfig>('API_CONFIG');
```

---

## ⚙️ Feature Deep Dive

### 1. Scoping & Hierarchy

Control *where* a service is created (Singleton vs Per-Injector).

- **`@Injectable()` (Default)**: Root Singleton. Shared globally across the entire app.
- **`@Scope('any')`**: Per-Injector Singleton. A new instance is created for **each injector** logic that requests it, but shared within that injector.
- **`@Scope('custom')`**: Restricted Singleton. Only visible and created in injectors specifically created with `{ scope: 'custom' }`.

```typescript
// Created once per injector (e.g., per-request or per-module)
@Scope('any')
@Injectable()
class RequestContext {}
```

### 2. Resolution Modifiers

Control *how* dependencies are resolved.

```typescript
import { Optional, SkipSelf, Self } from '@hwy-fm/di';

constructor(
  // return null instead of throwing if missing
  @Optional() private service?: MyService,

  // Start search from Parent Injector (skip local)
  @SkipSelf() private parentConfig: Config,

  // Only search in Current Injector
  @Self() private localData: LocalData
) {}
```

### 3. Lifecycle Hooks

Services can hook into their lifecycle by implementing specific methods.

| Method | Description |
| :--- | :--- |
| **`onInit()`** | Called immediately after instantiation. Can return a `Promise`. |
| **`destroy()`** | Called when `injector.destroy()` is invoked. |

```typescript
@Injectable()
class DatabaseService {
  private connection: any;

  // 1. Initialization (Sync or Async)
  async onInit() {
    this.connection = await createConnection();
    console.log('DB Connected');
  }

  // 2. Cleanup
  destroy() {
    this.connection.close();
    console.log('DB Closed');
  }
}
```

### 4. Concurrency & Context Isolation (Node.js)

In high-concurrency Node.js applications, global state is dangerous. Use `AsyncLocalStorage` to isolate dependency scopes per request.

```typescript
import { Injector, runInInjectionContext, INJECTOR_SCOPE, Injectable, Scope, InjectorToken, Inject } from '@hwy-fm/di';

// 1. Define Request-Scoped Token & Service
const REQUEST_ID = new InjectorToken<string>('REQUEST_ID');

@Scope('request') // Only created in injectors with scope='request'
@Injectable()
class RequestHandler {
  constructor(@Inject(REQUEST_ID) private id: string) {}

  process() {
    console.log(`Processing request: ${this.id}`);
  }
}

// 2. Handle Request
async function handleRequest(req, res) {
  const reqInjector = Injector.create([
    { provide: INJECTOR_SCOPE, useValue: 'request' }, // Bind scope name
    { provide: REQUEST_ID, useValue: req.headers['x-request-id'] }
  ], rootInjector);

  // 3. Run in Context (ALS)
  await runInInjectionContext(reqInjector, async () => {
     // Async work here preserves the active injector context
     const handler = reqInjector.get(RequestHandler);
     handler.process();
  });
}
```

---

## 🔥 Enterprise Patterns

### 1. Async Factories

The DI container fully supports `async/await` in factories.

```typescript
{
  provide: DB_CONNECTION,
  useFactory: async () => {
    const db = await connectToDatabase();
    return db;
  }
}

// ... later ...
// Use getAsync for tokens that might be async
const db = await injector.getAsync(DB_CONNECTION);
```

### 2. Standalone Bootstrapping (`resolveMinimal`)

For usage *outside* a container (e.g., app startup), use `resolveMinimal`. It creates a temporary sandbox to resolve a dependency and returns a cleanup function.

```typescript
import { resolveMinimalAsync } from '@hwy-fm/di';

const [loader, cleanup] = await resolveMinimalAsync(AppLoader);
await loader.initialize();
await cleanup(); // Dispose ephemeral instances
```

### 3. Global Admission Policy (The Gatekeeper)

Centralize your DI security and configuration logic. This function runs **before** any provider is added to any injector.

```typescript
import { InstantiationPolicy } from '@hwy-fm/di';

InstantiationPolicy.globalAdmission = (token, provider, injector) => {
  // Scenario: Feature Flags
  const meta = provider as any;
  if (meta.featureFlag && !FeatureFlags.isEnabled(meta.featureFlag)) {
    return false; // REJECT
  }
  return true;
};
```

### 4. Global Service Registration

Register providers without passing them to `Injector.create` manually.

```typescript
import { register, ROOT_SCOPE } from '@hwy-fm/di';

// Register globally
register({ provide: Logger, useClass: ConsoleLogger }, ROOT_SCOPE);
```

### 5. Multi-Providers (Plugins)

Bind multiple services to a single token.

```typescript
const PLUGINS = new InjectorToken('PLUGINS');

@MultiToken(PLUGINS)
class AuthPlugin {}

@MultiToken(PLUGINS)
class LoggerPlugin {}

// Returns array: [AuthPlugin, LoggerPlugin]
const plugins = injector.get(PLUGINS); 
```

### 6. Global Interception (The Middleware)

You can define a global interception strategy that runs for **every** service created by an injector. This is perfect for logging, metrics, or auditing.

```typescript
import { INTERCEPTORS, Injector } from '@hwy-fm/di';

const injector = Injector.create([
  {
    provide: INTERCEPTORS,
    useValue: (instance, token) => {
      console.log(`[Audit] Created instance of: ${token.name}`);
      return instance; 
    },
    multi: true
  }
]);
```

### 7. Private Providers & Visibility

Enforce strict encapsulation. A `private` provider is visible to the injector where it is defined, but **hidden** from children.

```typescript
const parent = Injector.create([
  { provide: SecretService, useClass: SecretService, private: true }
]);

const child = Injector.create([], parent);
parent.get(SecretService); // OK
child.get(SecretService); // Error: Not visible
```

---

## 🔌 Metaprogramming & AOP

### 1. Aspect-Oriented Programming (Method Proxy)

Automatically wrap methods with interceptors using `MethodProxy`.

```typescript
import { MethodProxy, HookMetadata } from '@hwy-fm/di';

HookMetadata.hook(Service, {
  after: (instance, token, injector) => {
    injector.get(MethodProxy).proxyMethod(instance, 'sensitiveMethod');
    return instance;
  }
});
```

### 2. Custom Decorators

Create your own semantic decorators.

**Class Decorators:**

```typescript
import { makeDecorator, setInjectableDef } from '@hwy-fm/di';

export const Controller = makeDecorator(
  'Controller', 
  (path: string) => ({ path }),
  (cls) => setInjectableDef(cls, { scope: 'root' })
);
```

**Parameter Decorators (With Data Transformation):**

Use `markInject` to connect a custom decorator to the DI system, allowing you to define injection tokens and transformation logic simultaneously.

```typescript
import { makeParamDecorator, markInject, DecoratorFlags, InjectorToken } from '@hwy-fm/di';

const APPLICATION_METADATA = new InjectorToken('APP_META');

// Helper to extract value from metadata object
const transform = (key: string) => (value: any) => value?.[key];

// Define @Input(key)
// 1. Injects APPLICATION_METADATA
// 2. Extracts the specific 'key' from the resolved object
export const Input = markInject(
  makeParamDecorator(
    'InputParamDecorator', 
    (key: string) => ({ 
      token: APPLICATION_METADATA, 
      transform: transform(key) 
    })
  ), 
  DecoratorFlags.Inject
);

// Usage: constructor(@Input('theme') theme: string)
```

### 3. Hook Metadata API Reference

| Hook | Type | Description |
| :--- | :--- | :--- |
| **`onTransientCheck`** | `boolean \| (token, record, ctx) => boolean` | **Forces** transient behavior. If `true`, the instance is **never cached** and **never tracked** for disposal. |
| **`onScopeCheck`** | `(def, scope, ctx) => boolean` | Custom logic to match the provider against the injector's scope. |
| **`customFactory`** | `(record, next, ctx) => any` | Intercept creation. Call `next()` to run the original factory. |
| **`onAllow`** | `(token, provider, ctx) => boolean` | Admission control. Return `false` to prevent the provider from being used. |
| **`before`** | `(token, record, ctx) => void` | Runs before instantiation begins. |
| **`after`** | `(instance, token, ctx) => void` | Runs after instantiation. Useful for property injection or proxies. |
| **`onError`** | `(error, token, ctx) => any` | Catch creation errors. Return a fallback value or rethrow. |
| **`onDispose`** | `(instance, ctx) => void` | Custom cleanup logic when the injector is destroyed. |

> **⚠️ Pure Transient Warning:**
> Services using `onTransientCheck` (Pure Transient) are **NOT** tracked by the injector for disposal.
> Their `destroy()` method will **NEVER** be called automatically.
>
> *Note: Services with `@Scope('any')` ARE tracked. They behave as "Per-Injector Singletons" (one instance per injector) and will be disposed when that specific injector is destroyed.*

---

## 🍳 Recipes & Patterns

**1. Virtual Modules (Zero-Boilerplate)**

Organize code using simple arrays. No complex Module classes required.

```typescript
// features/auth.ts
export const AUTH_PROVIDERS = [ AuthService, JwtStrategy ];

// app.ts
const appInjector = Injector.create([
  ...AUTH_PROVIDERS, // Just spread it!
  AppService
]);
```

**2. Lazy Loading / Code Splitting**

Load heavy dependencies only when requested.

```typescript
{
  provide: PDF_SERVICE,
  useFactory: async () => {
    const { PdfServiceImpl } = await import('./services/heavy-pdf');
    return new PdfServiceImpl(); // loaded on demand
  }
}
```

**3. Assisted Injection (Runtime Arguments)**

Combine DI with runtime parameters (like `userId`) using a Factory Function pattern.

```typescript
type UserSessionFactory = (userId: string) => UserSession;

const providers = [
  {
    provide: 'SESSION_FACTORY',
    // Inject 'Database', return function accepting 'userId'
    useFactory: (db: Database) => (userId: string) => new UserSession(db, userId),
    deps: [Database]
  }
];

// Usage: constructor(@Inject('SESSION_FACTORY') createSession: UserSessionFactory)
// this.createSession('user-123') -> new UserSession(db, 'user-123')
```

**4. Circular Dependencies**

Use `forwardRef` to break cycles between interdependent services.

```typescript
import { forwardRef, Inject } from '@hwy-fm/di';

class Parent {
  constructor(@Inject(forwardRef(() => Child)) child: any) {}
}

class Child {
  constructor(@Inject(forwardRef(() => Parent)) parent: any) {}
}
```

**5. Express.js Middleware (Context Isolation)**

Ensure every request runs in its own isolated scope using `AsyncLocalStorage`.

```typescript
import { Injector, runInInjectionContext, InjectorToken } from '@hwy-fm/di';

const REQ = new InjectorToken('REQ');

// Middleware
const diMiddleware = (rootInjector: Injector) => (req, res, next) => {
  const reqInjector = Injector.create([
    { provide: REQ, useValue: req }
  ], rootInjector);

  runInInjectionContext(reqInjector, next);
};
```

**6. React Integration**

Provide dependency injection context to your React component tree.

```tsx
const InjectorContext = createContext<Injector>(null!);

export const DIProvider = ({ providers, children }) => {
  const injector = useMemo(() => Injector.create(providers), []);
  return <DIContext.Provider value={injector}>{children}</DIContext.Provider>;
};
```

**7. Hot-Swappable Configuration**

Use `Proxy` to serve dynamic configuration that can change at runtime without restarting.

```typescript
let runtimeConfig = { theme: 'dark' };

const injector = Injector.create([
  {
    provide: 'CONFIG',
    // Always reads the latest value from runtimeConfig
    useFactory: () => new Proxy({}, { get: (_, k) => runtimeConfig[k] })
  }
]);
```

**8. Global Content Registry (Plugin Architecture)**

Use `TokenRegistry` to create global "Contribution Points" (like VS Code Extensions) without needing an Injector context.

```typescript
import { TokenRegistry } from '@hwy-fm/di';

// 1. Define a Contribution Point
const MENU_ITEMS = TokenRegistry.createScope('MENU_ITEMS', { multi: true });

// 2. Register items from anywhere (e.g., in other files)
TokenRegistry.register(MENU_ITEMS, { label: 'File' });
TokenRegistry.register(MENU_ITEMS, { label: 'Edit' });

// 3. Retrieve all registered items
const menus = TokenRegistry.getAll(MENU_ITEMS); 
```

---

## 🧪 Testing & Mocking

Writing unit tests with `@hwy-fm/di` is straightforward. You can easily override providers with mocks.

### 1. Unit Testing Services

```typescript
import { Injector } from '@hwy-fm/di';

// Real Service
class DatabaseService { 
  connect() { /* real connection */ } 
}

// Mock
const mockDb = { connect: jest.fn() };

test('UserService should use mock DB', () => {
  const injector = Injector.create([
    UserService,
    // Override with Mock
    { provide: DatabaseService, useValue: mockDb }
  ]);

  const user = injector.get(UserService);
  user.doWork();
  
  expect(mockDb.connect).toHaveBeenCalled();
});
```

### 2. Testing Logic outside Container (`resolveMinimal`)

For isolated logic tests without setting up a full injector hierarchy.

```typescript
import { resolveMinimal } from '@hwy-fm/di';

test('Isolated logic', async () => {
  const [service, dispose] = resolveMinimal(ComplexService);
  // ... test service ...
  dispose();
});
```

---

## 🛡 Strict Mode & Troubleshooting

**Enable Strict Mode:**
```typescript
import { InstantiationPolicy } from '@hwy-fm/di';
InstantiationPolicy.strictAsyncLifecycle = true; 
InstantiationPolicy.strictMultiInjection = true;
```

**Debug Logging:**
```typescript
import { DEBUG_MODE } from '@hwy-fm/di';
DEBUG_MODE.enabled = true;
```

---

## ⚡ Performance

- **Pre-compiled Factories**: Optimized for V8.
- **O(1) Resolution**: Map-based lookups.
- **No Class Scanning**: Explicit exports only.

---

## 🛠 Decorators API

| Decorator | Target | Description |
| :--- | :--- | :--- |
| **`@Injectable(options?)`** | Class | Marks a class as available to the injector. Options: `{ scope: 'root' }`. |
| **`@Inject(token)`** | Constructor Param | Optimizes injection when Type metadata is insufficient. |
| **`@Token(token)`** | Class | Single binding to a token. |
| **`@MultiToken(token)`** | Class | Multi binding to a token. |
| **`@Optional()`** | Constructor Param | Returns `null` if not found. |
| **`@Self()`** | Constructor Param | Only resolves from local injector. |
| **`@SkipSelf()`** | Constructor Param | Starts resolution from parent injector. |

---

## 📄 License

MIT © 2024
