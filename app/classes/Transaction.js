"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
var Transaction = /** @class */ (function () {
    function Transaction(sender, recipient, amount) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
    }
    return Transaction;
}());
exports.Transaction = Transaction;
