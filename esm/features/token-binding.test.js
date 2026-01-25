import { __awaiter, __decorate } from "tslib";
import { InjectorToken, ROOT_SCOPE, Injectable } from "../metadata/index.js";
import { Injector, INJECTOR_SCOPE, ɵɵInject } from "../registry/index.js";
import { Token, MultiToken } from "./token-binding.js";
// Helper to create valid root injector
function createTestInjector(providers = []) {
    return Injector.create([
        { provide: INJECTOR_SCOPE, useValue: ROOT_SCOPE },
        ...providers
    ]);
}
// Mock console to keep output clean and capture logs
const originalConsoleWarn = console.warn;
const warnings = [];
console.warn = (msg) => warnings.push(msg);
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Running TokenBinding Tests...');
        try {
            yield testTokenBinding();
            yield testMultiTokenSync();
            yield testMultiTokenAsync();
            yield testConcurrentAsyncIsolation();
        }
        catch (e) {
            console.error('Tests Failed:', e);
            process.exit(1);
        }
        finally {
            console.warn = originalConsoleWarn;
        }
    });
}
let ServiceA = class ServiceA {
    constructor() {
        this.name = 'A';
    }
};
ServiceA = __decorate([
    Injectable()
], ServiceA);
let ServiceB = class ServiceB {
    constructor() {
        this.name = 'B';
    }
};
ServiceB = __decorate([
    Injectable()
], ServiceB);
const SINGLE_TOKEN = new InjectorToken('SINGLE_TOKEN');
const MULTI_TOKEN = new InjectorToken('MULTI_TOKEN');
// --- Test 1: @Token Binding ---
// @Token makes the token point to the class. 
// ImplementationA needs @Injectable to be resolvable if it's looked up directly, 
// but here it is looked up via token which has the definition. 
// However, the resolution process might inspect the class for deps.
function testTokenBinding() {
    return __awaiter(this, void 0, void 0, function* () {
        let ImplementationA = class ImplementationA extends ServiceA {
        };
        ImplementationA = __decorate([
            Token(SINGLE_TOKEN),
            Injectable()
        ], ImplementationA);
        const injector = createTestInjector([]);
        const instance = injector.get(SINGLE_TOKEN);
        if (instance instanceof ImplementationA && instance.name === 'A') {
            console.log('✅ @Token binding passed');
        }
        else {
            throw new Error('@Token binding failed');
        }
    });
}
// --- Test 2: @MultiToken Sync ---
function testMultiTokenSync() {
    return __awaiter(this, void 0, void 0, function* () {
        let Impl1 = class Impl1 {
            constructor() {
                this.val = 1;
            }
        };
        Impl1 = __decorate([
            MultiToken(MULTI_TOKEN),
            Injectable()
        ], Impl1);
        let Impl2 = class Impl2 {
            constructor() {
                this.val = 2;
            }
        };
        Impl2 = __decorate([
            MultiToken(MULTI_TOKEN),
            Injectable()
        ], Impl2);
        const injector = createTestInjector([]);
        // @ts-ignore
        const instances = injector.get(MULTI_TOKEN);
        if (Array.isArray(instances) && instances.length === 2 && instances[0].val === 1 && instances[1].val === 2) {
            console.log('✅ @MultiToken sync resolution passed');
        }
        else {
            throw new Error(`@MultiToken sync resolution failed. Got: ${JSON.stringify(instances)}`);
        }
    });
}
// --- Test 3: @MultiToken Async ---
function testMultiTokenAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        const ASYNC_MULTI = new InjectorToken('ASYNC_MULTI');
        let SyncPart = class SyncPart {
            constructor() {
                this.type = 'sync';
            }
        };
        SyncPart = __decorate([
            MultiToken(ASYNC_MULTI),
            Injectable()
        ], SyncPart);
        let AsyncPart = class AsyncPart {
            constructor() {
                this.type = 'async';
            }
            static onInit() {
                return __awaiter(this, void 0, void 0, function* () { yield new Promise(r => setTimeout(r, 10)); });
            }
        };
        AsyncPart = __decorate([
            MultiToken(ASYNC_MULTI),
            Injectable()
        ], AsyncPart);
        const injector = createTestInjector([]);
        const instances = yield injector.getAsync(ASYNC_MULTI);
        if (instances.some((i) => i.type === 'sync') && instances.some((i) => i.type === 'async')) {
            console.log('✅ @MultiToken async resolution passed');
        }
        else {
            throw new Error('@MultiToken async resolution failed');
        }
    });
}
// --- Test 4: Concurrent Context Isolation (Crucial for ALS) ---
function testConcurrentAsyncIsolation() {
    return __awaiter(this, void 0, void 0, function* () {
        const CONTEXT_TOKEN = new InjectorToken('CONTEXT_TOKEN');
        // A factory that returns the value of CONTEXT_TOKEN from the CURRENT injector
        const CHECKER_TOKEN = new InjectorToken('CHECKER');
        const injectorA = createTestInjector([
            { provide: CONTEXT_TOKEN, useValue: 'InjectorA' },
            { provide: CHECKER_TOKEN, useFactory: () => __awaiter(this, void 0, void 0, function* () {
                    yield new Promise(r => setTimeout(r, 20)); // delay to allow context switch
                    // This inject relies on implicit context being preserved across await
                    return ɵɵInject(CONTEXT_TOKEN);
                }) }
        ]);
        const injectorB = createTestInjector([
            { provide: CONTEXT_TOKEN, useValue: 'InjectorB' },
            { provide: CHECKER_TOKEN, useFactory: () => __awaiter(this, void 0, void 0, function* () {
                    yield new Promise(r => setTimeout(r, 10));
                    return ɵɵInject(CONTEXT_TOKEN);
                }) }
        ]);
        console.log('⏳ Starting concurrent isolation test...');
        // Run both in parallel
        const [resA, resB] = yield Promise.all([
            injectorA.getAsync(CHECKER_TOKEN),
            injectorB.getAsync(CHECKER_TOKEN)
        ]);
        if (resA === 'InjectorA' && resB === 'InjectorB') {
            console.log('✅ Concurrent Async Context Isolation Passed (ALS working)');
        }
        else {
            throw new Error(`Context pollution detected! A got ${resA}, B got ${resB}`);
        }
    });
}
runTests().catch(e => {
    console.error(e);
    process.exit(1);
});
