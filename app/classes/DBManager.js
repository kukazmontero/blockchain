"use strict";
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBAccounts = exports.DBBlocks = void 0;
var level_1 = require("level");
var Account_1 = require("./Account");
var DBBlocks = /** @class */ (function () {
    function DBBlocks(dbPath) {
        var _this = this;
        this.getTotalBlocks2 = function () { return __awaiter(_this, void 0, void 0, function () {
            var block_data, block, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.iterator().all()];
                    case 1:
                        block_data = _b.sent();
                        block = JSON.stringify(block_data);
                        return [2 /*return*/, block];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.getLastBlock = function () { return __awaiter(_this, void 0, void 0, function () {
            var index, last_block_data, last_block, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getTotalBlocks()];
                    case 1:
                        index = _b.sent();
                        if (!(index != null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.db.get("block-".concat(index - 1))];
                    case 2:
                        last_block_data = _b.sent();
                        last_block = JSON.parse(last_block_data);
                        return [2 /*return*/, last_block];
                    case 3: return [2 /*return*/, null];
                    case 4:
                        _a = _b.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.db = new level_1.Level(dbPath, { valueEncoding: 'json' });
    }
    DBBlocks.prototype.getTotalBlocks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.iterator().all()];
                    case 1: return [2 /*return*/, (_b.sent()).length];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DBBlocks.prototype.saveBlock = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var blockData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        blockData = JSON.stringify(block);
                        return [4 /*yield*/, this.db.put("block-".concat(block.index), blockData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DBBlocks.prototype.loadBlock = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            var blockData, block, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.get("block-".concat(index))];
                    case 1:
                        blockData = _a.sent();
                        block = JSON.parse(blockData);
                        return [2 /*return*/, block];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DBBlocks.prototype.printBlocks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalBlocks, i, block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTotalBlocks()];
                    case 1:
                        totalBlocks = _a.sent();
                        if (totalBlocks == null)
                            return [2 /*return*/];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < totalBlocks)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.loadBlock(i)];
                    case 3:
                        block = _a.sent();
                        if (block) {
                            console.log("Block ".concat(block.index, ":"));
                            console.log("Index: ".concat(block.index));
                            console.log("Timestamp: ".concat(new Date(block.timestamp).toLocaleString()));
                            console.log("Previous Hash: ".concat(block.previousHash));
                            console.log("Transactions:");
                            block.transactions.forEach(function (transaction, index) {
                                console.log("    Transaction ".concat(index + 1, ":"));
                                console.log("    Sender: ".concat(transaction.sender));
                                console.log("    Receiver: ".concat(transaction.recipient));
                                console.log("    Amount: ".concat(transaction.amount));
                                console.log("    Signature of the transaction ".concat(index + 1, ": ").concat(transaction.signature));
                                console.log("    Valid Signature: ".concat(transaction.valido));
                            });
                            console.log("\n");
                        }
                        else {
                            console.log("Block ".concat(i, " no find."));
                        }
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return DBBlocks;
}());
exports.DBBlocks = DBBlocks;
var DBAccounts = /** @class */ (function () {
    function DBAccounts(dbPath) {
        this.db = new level_1.Level(dbPath, { valueEncoding: 'json' });
    }
    DBAccounts.prototype.getTotalAccounts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.db.iterator().all()];
                    case 1: return [2 /*return*/, (_b.sent()).length];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DBAccounts.prototype.registerAccount = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var account, accountData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = new Account_1.Account(name);
                        accountData = JSON.stringify(account);
                        return [4 /*yield*/, this.db.put(account.address, accountData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, accountData];
                }
            });
        });
    };
    DBAccounts.prototype.registerAccount2 = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var account, accountData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = JSON.parse(data);
                        accountData = JSON.stringify(account);
                        return [4 /*yield*/, this.db.put(account.address, accountData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, accountData];
                }
            });
        });
    };
    DBAccounts.prototype.registerAccountnotNode = function (new_account) {
        return __awaiter(this, void 0, void 0, function () {
            var accountData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accountData = new_account;
                        return [4 /*yield*/, this.db.put(JSON.parse(new_account).address, accountData)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, JSON.parse(accountData).address];
                }
            });
        });
    };
    DBAccounts.prototype.getAccountByAddress = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        _b = (_a = JSON).parse;
                        return [4 /*yield*/, this.db.get(address)];
                    case 1: return [4 /*yield*/, _b.apply(_a, [_d.sent()])];
                    case 2: return [2 /*return*/, _d.sent()];
                    case 3:
                        _c = _d.sent();
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DBAccounts.prototype.printAccounts = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalAccounts, accounts;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTotalAccounts()];
                    case 1:
                        totalAccounts = _a.sent();
                        if (totalAccounts == null)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.db.keys().all()];
                    case 2:
                        accounts = _a.sent();
                        accounts.map(function (element) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _b = (_a = console).log;
                                        return [4 /*yield*/, this.getAccountByAddress(element)];
                                    case 1:
                                        _b.apply(_a, [_c.sent()]);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    return DBAccounts;
}());
exports.DBAccounts = DBAccounts;
