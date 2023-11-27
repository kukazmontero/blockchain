"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
var crypto_js_1 = require("crypto-js");
var Transaction = /** @class */ (function () {
    function Transaction(sender, recipient, amount, nonce, privateKey, publicKey) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
        this.signature = this.signTransaction(privateKey); // Firmar la transacción al crearla
        this.valido = this.verifySignature(publicKey); // Firmar la transacción al crearla
        this.nonce = nonce;
    }
    Transaction.prototype.signTransaction = function (privateKey) {
        var dataToSign = "".concat(this.sender).concat(this.recipient).concat(this.amount);
        var signature = (0, crypto_js_1.SHA256)(dataToSign, privateKey).toString(crypto_js_1.enc.Hex);
        return signature;
    };
    Transaction.prototype.verifySignature = function (publicKey) {
        var dataToSign = "".concat(this.sender).concat(this.recipient).concat(this.amount);
        var computedSignature = (0, crypto_js_1.SHA256)(dataToSign, publicKey).toString(crypto_js_1.enc.Hex);
        return computedSignature === this.signature;
    };
    return Transaction;
}());
exports.Transaction = Transaction;
