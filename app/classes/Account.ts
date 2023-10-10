import { ethers } from 'ethers';

export class Cuenta {
  private mnemonica: string;
  private addr: string | undefined;
  private clavePrivada: string | undefined;
  private clavePublica: string | undefined;

  constructor() {
    this.mnemonica = '';
  }

  generarMnemonica(): void {
    const wallet = ethers.Wallet.createRandom();
    this.mnemonica = wallet.mnemonic.phrase;
  }

  obtenerMnemonica(): string {
    return this.mnemonica;
  }

  generarDireccion(): void {
    if (this.mnemonica) {
      const wallet = ethers.Wallet.fromPhrase(this.mnemonica);
      this.addr = wallet.address;
    }
  }

  obtenerDireccion(): string | undefined {
    return this.addr;
  }

  generarClaves(): void {
    if (this.mnemonica) {
      const wallet = ethers.Wallet.fromPhrase(this.mnemonica);
      this.clavePrivada = wallet.privateKey;
      this.clavePublica = wallet.publicKey;
    }
  }

  obtenerClavePrivada(): string | undefined {
    return this.clavePrivada;
  }

  obtenerClavePublica(): string | undefined {
    return this.clavePublica;
  }
}



// const miCuenta = new Cuenta();
// miCuenta.generarMnemonica();
// miCuenta.generarDireccion();
// miCuenta.generarClaves();

// console.log('Mnemónica:', miCuenta.obtenerMnemonica());
// console.log('Dirección:', miCuenta.obtenerDireccion());
// console.log('Clave Privada:', miCuenta.obtenerClavePrivada());
// console.log('Clave Pública:', miCuenta.obtenerClavePublica());
