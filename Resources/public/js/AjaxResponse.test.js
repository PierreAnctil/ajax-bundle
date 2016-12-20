/// <reference path="AjaxResponse.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var urlTest = 'https://httpbin.org/';
$(document).on('axiolabajax.request_locked', function () {
    console.log('cb - OK : failed because of multiple requests');
});
$(document).on('axiolabajax.error', function () {
    console.log('request error');
});
AxiolabAjax
    .request(urlTest + 'get', {}, function (response) {
    console.log("cb - OK callback GET " + response.url);
    AxiolabAjax.request(urlTest + 'post', {}, function (response) {
        console.log("cb - OK callback POST " + response.url);
        withLockTest();
    }, 'POST');
}, 'GET');
var finishedCbs = 0;
function withLockTest() {
    AxiolabAjax.request(urlTest + 'post', {}, function (response) {
        console.log("cb - OK promise locked POST " + response.url);
        AxiolabAjax.request(urlTest + 'post', {}, function (response) {
            console.log("cb - OK promise after locked POST " + response.url);
            testPromise();
        });
    }, {
        method: 'POST',
        withLock: true
    });
    // relancer
    AxiolabAjax.request(urlTest + 'post', {}, function (response) {
        // should not happen
        console.log("cb - OK callback POST " + response.url);
    });
}
function testPromise() {
    AxiolabAjax.usePromise = true;
    return AxiolabAjax
        .request(urlTest + 'get', {}, { method: 'GET' })
        .then(function (response) {
        console.log("prom - OK promise GET " + response.url);
        return AxiolabAjax.request(urlTest + 'post', {}, { method: 'POST' });
    })
        .then(function (response) {
        console.log("prom - OK promise POST " + response.url);
        var prom = AxiolabAjax.request(urlTest + 'post', {}, { method: 'POST', withLock: true });
        AxiolabAjax.request(urlTest + 'post', {}, { method: 'POST' }).fail(function () {
            return console.log('prom - OK : failed because of multiple requests');
        });
        return prom;
    })
        .then(function (response) {
        console.log("prom - OK promise locked POST " + response.url);
        return AxiolabAjax.request(urlTest + 'post', {}, { method: 'POST' });
    })
        .then(function (response) {
        console.log("prom - OK promise after locked POST " + response.url);
    })
        .then(function () { return testPromiseAsync(); });
}
function testPromiseAsync() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, AxiolabAjax.request(urlTest + 'get', {}, { method: 'GET' })];
                case 1:
                    response = _a.sent();
                    console.log("async - OK async GET " + response.url);
                    return [4 /*yield*/, AxiolabAjax.request(urlTest + 'post', {}, { method: 'POST' })];
                case 2:
                    response = _a.sent();
                    console.log("async - OK async POST " + response.url);
                    return [4 /*yield*/, runWithLock()];
                case 3:
                    response = _a.sent();
                    console.log("async - OK promise locked POST " + response.url);
                    return [4 /*yield*/, AxiolabAjax.request(urlTest + 'post', {}, { method: 'POST' })];
                case 4:
                    response = _a.sent();
                    console.log("async - OK promise after locked POST " + response.url);
                    return [2 /*return*/];
            }
        });
    });
}
function runWithLock() {
    return __awaiter(this, void 0, void 0, function () {
        var prom, a, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    prom = AxiolabAjax.request(urlTest + 'post', {}, { method: 'POST', withLock: true });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, AxiolabAjax.request(urlTest + 'post', {}, { method: 'POST' })];
                case 2:
                    _a.sent();
                    a = 1;
                    return [3 /*break*/, 4];
                case 3:
                    ex_1 = _a.sent();
                    console.log('async - OK : failed because of multiple requests');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, prom];
            }
        });
    });
}
//# sourceMappingURL=AjaxResponse.test.js.map