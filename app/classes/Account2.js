"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
var ethers_1 = require("ethers");
var Account = /** @class */ (function () {
    function Account(name) {
        this.name = name;
        this.mnemonic = ethers_1.Wallet.createRandom().mnemonic.phrase;
        this.wallet = ethers_1.Wallet.fromMnemonic(this.mnemonic);
        this.address = this.wallet.address;
        this.privatekey = this.wallet.privateKey;
        this.publickey = this.wallet.publicKey;
    }
    return Account;
}());
exports.Account = Account;
