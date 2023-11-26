"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
var crypto_js_1 = require("crypto-js");
var Block = /** @class */ (function () {
    function Block(index, timestamp, transactions, previousHash, nonce) {
        var _this = this;
        this.calculateHash = function () {
            var data = "".concat(_this.index).concat(_this.timestamp).concat(_this.previousHash).concat(_this.nonce);
            _this.transactions.forEach(function (transaction) {
                var sender = transaction.sender, recipient = transaction.recipient, amount = transaction.amount;
                data += "".concat(sender).concat(recipient).concat(amount);
            });
            return (0, crypto_js_1.SHA256)(data).toString();
        };
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = nonce;
        this.hash = this.calculateHash();
    }
    return Block;
}());
exports.Block = Block;
