import { Wallet } from 'ethers';

export class Account {
  public name: string;
  public mnemonic: string;
  public address: string;
  public wallet: any;
  public privatekey: string;
  public publickey: string;
  public money: number;
  public blocked: boolean;

  constructor(name:string) {
    this.name = name;
    this.mnemonic = Wallet.createRandom().mnemonic.phrase;

    this.wallet = Wallet.fromMnemonic(this.mnemonic);
    this.address = this.wallet.address;
    this.privatekey = this.wallet.privateKey;
    this.publickey = this.wallet.publicKey;
    this.money = 100;
    this.blocked = false;
  }
}