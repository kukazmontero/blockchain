"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ethers_1 = require("ethers");
var Cuenta = /** @class */ (function () {
    function Cuenta() {
        this.mnemonica = '';
    }
    Cuenta.prototype.generarMnemonica = function () {
        var wallet = ethers_1.ethers.Wallet.createRandom();
        this.mnemonica = wallet.mnemonic.phrase;
    };
    Cuenta.prototype.obtenerMnemonica = function () {
        return this.mnemonica;
    };
    Cuenta.prototype.generarDireccion = function () {
        if (this.mnemonica) {
            var wallet = ethers_1.ethers.Wallet.fromPhrase(this.mnemonica);
            this.addr = wallet.address;
        }
    };
    Cuenta.prototype.obtenerDireccion = function () {
        return this.addr;
    };
    Cuenta.prototype.generarClaves = function () {
        if (this.mnemonica) {
            var wallet = ethers_1.ethers.Wallet.fromPhrase(this.mnemonica);
            this.clavePrivada = wallet.privateKey;
            this.clavePublica = wallet.publicKey;
        }
    };
    Cuenta.prototype.obtenerClavePrivada = function () {
        return this.clavePrivada;
    };
    Cuenta.prototype.obtenerClavePublica = function () {
        return this.clavePublica;
    };
    return Cuenta;
}());
// const miCuenta = new Cuenta();
// miCuenta.generarMnemonica();
// miCuenta.generarDireccion();
// miCuenta.generarClaves();
// console.log('Mnemónica:', miCuenta.obtenerMnemonica());
// console.log('Dirección:', miCuenta.obtenerDireccion());
// console.log('Clave Privada:', miCuenta.obtenerClavePrivada());
// console.log('Clave Pública:', miCuenta.obtenerClavePublica());
