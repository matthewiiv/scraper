"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
var providers_1 = require("@ethersproject/providers");
var axios_1 = require("axios");
var axios_rate_limit_1 = require("axios-rate-limit");
var ethers_1 = require("ethers");
var mongodb_1 = require("mongodb");
var get_abi_1 = require("../src/etherscan/get-abi");
function getCollectionStats(collectionSlug) {
    return __awaiter(this, void 0, void 0, function () {
        var url, http, response, stats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://api.opensea.io/api/v1/collection/".concat(collectionSlug, "/stats");
                    http = (0, axios_rate_limit_1["default"])(axios_1["default"].create(), {
                        maxRequests: 4,
                        perMilliseconds: 1000
                    });
                    return [4 /*yield*/, http.get(url, {
                            headers: { "X-API-KEY": process.env.OPENSEA_API_KEY || "" }
                        })];
                case 1:
                    response = _a.sent();
                    stats = response.data.stats;
                    return [2 /*return*/, stats];
            }
        });
    });
}
function getListings(collectionSlug) {
    return __awaiter(this, void 0, void 0, function () {
        var aggregatedAssets, cursor, count, retries, http, url, response, _a, assets, next, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    aggregatedAssets = [];
                    cursor = "";
                    count = 0;
                    retries = 0;
                    http = (0, axios_rate_limit_1["default"])(axios_1["default"].create(), {
                        maxRequests: 4,
                        perMilliseconds: 1000
                    });
                    _b.label = 1;
                case 1:
                    if (!(retries < 10)) return [3 /*break*/, 6];
                    console.log("Fetched ".concat(count * 50, " ").concat(collectionSlug));
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    url = "https://api.opensea.io/api/v1/assets?" +
                        new URLSearchParams(__assign({ collection_slug: collectionSlug, limit: "50", include_orders: "true" }, (cursor ? { cursor: cursor } : {})));
                    return [4 /*yield*/, http.get(url, {
                            headers: { "X-API-KEY": process.env.OPENSEA_API_KEY || "" }
                        })];
                case 3:
                    response = _b.sent();
                    _a = response.data, assets = _a.assets, next = _a.next;
                    if (assets) {
                        aggregatedAssets = __spreadArray(__spreadArray([], aggregatedAssets, true), assets, true);
                        if (!next) {
                            return [2 /*return*/, aggregatedAssets
                                    .map(function (asset) {
                                    var _a;
                                    return (__assign(__assign({}, asset), { main_order: (_a = asset.sell_orders) === null || _a === void 0 ? void 0 : _a.filter(function (order) {
                                            var _a, _b, _c;
                                            return order.sale_kind === 0 &&
                                                order.side === 1 &&
                                                ((_a = order.taker) === null || _a === void 0 ? void 0 : _a.address) ===
                                                    "0x0000000000000000000000000000000000000000" &&
                                                ((_b = order.maker) === null || _b === void 0 ? void 0 : _b.address) === ((_c = asset.owner) === null || _c === void 0 ? void 0 : _c.address);
                                        })[0] }));
                                })
                                    .filter(function (a) { return a.main_order; })];
                        }
                        cursor = next;
                        count++;
                    }
                    else {
                        console.log("Couldn't fetch assets", assets);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    console.log("Retrying", e_1);
                    retries++;
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function updateClaimedStatus(assets, contractFunction) {
    return __awaiter(this, void 0, void 0, function () {
        function tokenClaimed(token) {
            return __awaiter(this, void 0, void 0, function () {
                var e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, contract[contractFunction](token)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2:
                            e_2 = _a.sent();
                            return [2 /*return*/];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        var contractAddress, provider, abi, contract, tokens, tokensClaimed;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contractAddress = "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258";
                    provider = new providers_1.AlchemyProvider("mainnet", process.env.ALCHEMY_API_KEY);
                    return [4 /*yield*/, (0, get_abi_1["default"])(contractAddress)];
                case 1:
                    abi = _a.sent();
                    contract = new ethers_1.ethers.Contract(contractAddress, abi, provider);
                    tokens = assets
                        .map(function (a) { return (__assign(__assign({}, a), { price: a.main_order
                            ? parseFloat(ethers_1.ethers.utils.formatEther(a.main_order.base_price))
                            : undefined })); })
                        .filter(function (a) { return a.price; })
                        .sort(function (a, b) { return (a.price || 0) - (b.price || 0); });
                    return [4 /*yield*/, Promise.all(tokens.map(function (token) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            var _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _a = [__assign({}, token)];
                                        _b = {};
                                        return [4 /*yield*/, tokenClaimed(token.token_id)];
                                    case 1: return [2 /*return*/, (__assign.apply(void 0, _a.concat([(_b.claimed = _c.sent(), _b)])))];
                                }
                            });
                        }); }))];
                case 2:
                    tokensClaimed = (_a.sent()).filter(function (t) { return !t.claimed; });
                    return [2 /*return*/, tokensClaimed];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var mutantStats, mutants, mutantsNotClaimed, _a, apeStats, apes, apesNotClaimed, _b, mongoClient, e_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, getCollectionStats("mutant-ape-yacht-club")];
                case 1:
                    mutantStats = _c.sent();
                    return [4 /*yield*/, getListings("mutant-ape-yacht-club")];
                case 2:
                    mutants = _c.sent();
                    if (!mutants) return [3 /*break*/, 4];
                    return [4 /*yield*/, updateClaimedStatus(mutants, "betaClaimed")];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = null;
                    _c.label = 5;
                case 5:
                    mutantsNotClaimed = _a;
                    return [4 /*yield*/, getCollectionStats("boredapeyachtclub")];
                case 6:
                    apeStats = _c.sent();
                    return [4 /*yield*/, getListings("boredapeyachtclub")];
                case 7:
                    apes = _c.sent();
                    if (!apes) return [3 /*break*/, 9];
                    return [4 /*yield*/, updateClaimedStatus(apes, "alphaClaimed")];
                case 8:
                    _b = _c.sent();
                    return [3 /*break*/, 10];
                case 9:
                    _b = null;
                    _c.label = 10;
                case 10:
                    apesNotClaimed = _b;
                    mongoClient = new mongodb_1.MongoClient("mongodb+srv://".concat(process.env.MONGO_USERNAME, ":").concat(process.env.MONGO_PASSWORD, "@cluster0.ulnom.mongodb.net/").concat(process.env.MONGO_ORGANISATION, "?retryWrites=true&w=majority"));
                    _c.label = 11;
                case 11:
                    _c.trys.push([11, 20, , 22]);
                    return [4 /*yield*/, mongoClient.connect()];
                case 12:
                    _c.sent();
                    return [4 /*yield*/, mongoClient.db().collection("opensea-collections").updateOne({ collection_slug: "mutant-ape-yacht-club" }, { $set: mutantStats }, {
                            upsert: true
                        })];
                case 13:
                    _c.sent();
                    return [4 /*yield*/, mongoClient.db().collection("opensea-collections").updateOne({ collection_slug: "boredapeyachtclub" }, { $set: apeStats }, {
                            upsert: true
                        })];
                case 14:
                    _c.sent();
                    if (!mutantsNotClaimed) return [3 /*break*/, 16];
                    return [4 /*yield*/, mongoClient
                            .db()
                            .collection("opensea-assets")
                            .updateOne({ collection_slug: "mutant-ape-yacht-club" }, { $set: { listed_assets: mutantsNotClaimed } }, { upsert: true })];
                case 15:
                    _c.sent();
                    _c.label = 16;
                case 16:
                    if (!apesNotClaimed) return [3 /*break*/, 18];
                    return [4 /*yield*/, mongoClient
                            .db()
                            .collection("opensea-assets")
                            .updateOne({ collection_slug: "boredapeyachtclub" }, { $set: { listed_assets: apesNotClaimed } }, {
                            upsert: true
                        })];
                case 17:
                    _c.sent();
                    _c.label = 18;
                case 18: return [4 /*yield*/, mongoClient.close()];
                case 19:
                    _c.sent();
                    run();
                    return [3 /*break*/, 22];
                case 20:
                    e_3 = _c.sent();
                    return [4 /*yield*/, mongoClient.close()];
                case 21:
                    _c.sent();
                    run();
                    return [3 /*break*/, 22];
                case 22: return [2 /*return*/];
            }
        });
    });
}
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        run();
        return [2 /*return*/];
    });
}); })();
