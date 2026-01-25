import { __awaiter, __decorate, __extends, __generator, __read, __spreadArray } from "tslib";
import { InjectorToken, ROOT_SCOPE, Injectable } from "../metadata/index.js";
import { Injector, INJECTOR_SCOPE, ɵɵInject } from "../registry/index.js";
import { Token, MultiToken } from "./token-binding.js";
// Helper to create valid root injector
function createTestInjector(providers) {
    if (providers === void 0) { providers = []; }
    return Injector.create(__spreadArray([
        { provide: INJECTOR_SCOPE, useValue: ROOT_SCOPE }
    ], __read(providers), false));
}
// Mock console to keep output clean and capture logs
var originalConsoleWarn = console.warn;
var warnings = [];
console.warn = function (msg) { return warnings.push(msg); };
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Running TokenBinding Tests...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, testTokenBinding()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testMultiTokenSync()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, testMultiTokenAsync()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, testConcurrentAsyncIsolation()];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 6:
                    e_1 = _a.sent();
                    console.error('Tests Failed:', e_1);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 7:
                    console.warn = originalConsoleWarn;
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
var ServiceA = /** @class */ (function () {
    function ServiceA() {
        this.name = 'A';
    }
    ServiceA = __decorate([
        Injectable()
    ], ServiceA);
    return ServiceA;
}());
var ServiceB = /** @class */ (function () {
    function ServiceB() {
        this.name = 'B';
    }
    ServiceB = __decorate([
        Injectable()
    ], ServiceB);
    return ServiceB;
}());
var SINGLE_TOKEN = new InjectorToken('SINGLE_TOKEN');
var MULTI_TOKEN = new InjectorToken('MULTI_TOKEN');
// --- Test 1: @Token Binding ---
// @Token makes the token point to the class. 
// ImplementationA needs @Injectable to be resolvable if it's looked up directly, 
// but here it is looked up via token which has the definition. 
// However, the resolution process might inspect the class for deps.
function testTokenBinding() {
    return __awaiter(this, void 0, void 0, function () {
        var ImplementationA, injector, instance;
        return __generator(this, function (_a) {
            ImplementationA = /** @class */ (function (_super) {
                __extends(ImplementationA, _super);
                function ImplementationA() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                ImplementationA = __decorate([
                    Token(SINGLE_TOKEN),
                    Injectable()
                ], ImplementationA);
                return ImplementationA;
            }(ServiceA));
            injector = createTestInjector([]);
            instance = injector.get(SINGLE_TOKEN);
            if (instance instanceof ImplementationA && instance.name === 'A') {
                console.log('✅ @Token binding passed');
            }
            else {
                throw new Error('@Token binding failed');
            }
            return [2 /*return*/];
        });
    });
}
// --- Test 2: @MultiToken Sync ---
function testMultiTokenSync() {
    return __awaiter(this, void 0, void 0, function () {
        var Impl1, Impl2, injector, instances;
        return __generator(this, function (_a) {
            Impl1 = /** @class */ (function () {
                function Impl1() {
                    this.val = 1;
                }
                Impl1 = __decorate([
                    MultiToken(MULTI_TOKEN),
                    Injectable()
                ], Impl1);
                return Impl1;
            }());
            Impl2 = /** @class */ (function () {
                function Impl2() {
                    this.val = 2;
                }
                Impl2 = __decorate([
                    MultiToken(MULTI_TOKEN),
                    Injectable()
                ], Impl2);
                return Impl2;
            }());
            injector = createTestInjector([]);
            instances = injector.get(MULTI_TOKEN);
            if (Array.isArray(instances) && instances.length === 2 && instances[0].val === 1 && instances[1].val === 2) {
                console.log('✅ @MultiToken sync resolution passed');
            }
            else {
                throw new Error("@MultiToken sync resolution failed. Got: ".concat(JSON.stringify(instances)));
            }
            return [2 /*return*/];
        });
    });
}
// --- Test 3: @MultiToken Async ---
function testMultiTokenAsync() {
    return __awaiter(this, void 0, void 0, function () {
        var ASYNC_MULTI, SyncPart, AsyncPart, injector, instances;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ASYNC_MULTI = new InjectorToken('ASYNC_MULTI');
                    SyncPart = /** @class */ (function () {
                        function SyncPart() {
                            this.type = 'sync';
                        }
                        SyncPart = __decorate([
                            MultiToken(ASYNC_MULTI),
                            Injectable()
                        ], SyncPart);
                        return SyncPart;
                    }());
                    AsyncPart = /** @class */ (function () {
                        function AsyncPart() {
                            this.type = 'async';
                        }
                        AsyncPart.onInit = function () {
                            return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 10); })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            }); });
                        };
                        AsyncPart = __decorate([
                            MultiToken(ASYNC_MULTI),
                            Injectable()
                        ], AsyncPart);
                        return AsyncPart;
                    }());
                    injector = createTestInjector([]);
                    return [4 /*yield*/, injector.getAsync(ASYNC_MULTI)];
                case 1:
                    instances = _a.sent();
                    if (instances.some(function (i) { return i.type === 'sync'; }) && instances.some(function (i) { return i.type === 'async'; })) {
                        console.log('✅ @MultiToken async resolution passed');
                    }
                    else {
                        throw new Error('@MultiToken async resolution failed');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// --- Test 4: Concurrent Context Isolation (Crucial for ALS) ---
function testConcurrentAsyncIsolation() {
    return __awaiter(this, void 0, void 0, function () {
        var CONTEXT_TOKEN, CHECKER_TOKEN, injectorA, injectorB, _a, resA, resB;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    CONTEXT_TOKEN = new InjectorToken('CONTEXT_TOKEN');
                    CHECKER_TOKEN = new InjectorToken('CHECKER');
                    injectorA = createTestInjector([
                        { provide: CONTEXT_TOKEN, useValue: 'InjectorA' },
                        { provide: CHECKER_TOKEN, useFactory: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 20); })];
                                        case 1:
                                            _a.sent(); // delay to allow context switch
                                            // This inject relies on implicit context being preserved across await
                                            return [2 /*return*/, ɵɵInject(CONTEXT_TOKEN)];
                                    }
                                });
                            }); } }
                    ]);
                    injectorB = createTestInjector([
                        { provide: CONTEXT_TOKEN, useValue: 'InjectorB' },
                        { provide: CHECKER_TOKEN, useFactory: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 10); })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/, ɵɵInject(CONTEXT_TOKEN)];
                                    }
                                });
                            }); } }
                    ]);
                    console.log('⏳ Starting concurrent isolation test...');
                    return [4 /*yield*/, Promise.all([
                            injectorA.getAsync(CHECKER_TOKEN),
                            injectorB.getAsync(CHECKER_TOKEN)
                        ])];
                case 1:
                    _a = __read.apply(void 0, [_b.sent(), 2]), resA = _a[0], resB = _a[1];
                    if (resA === 'InjectorA' && resB === 'InjectorB') {
                        console.log('✅ Concurrent Async Context Isolation Passed (ALS working)');
                    }
                    else {
                        throw new Error("Context pollution detected! A got ".concat(resA, ", B got ").concat(resB));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
runTests().catch(function (e) {
    console.error(e);
    process.exit(1);
});
