import { SHA256, enc, HmacSHA256 } from 'crypto-js';

export class Transaction {
    sender: string;
    recipient: string;
    amount: number;
    signature: string;
    valido: boolean;
    nonce: number;

    constructor(sender: string, recipient: string, amount: number, nonce: number, privateKey?: string, publicKey?: string) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
        this.signature = this.signTransaction(privateKey); // Firmar la transacción al crearla
        this.valido = this.verifySignature(publicKey); // Firmar la transacción al crearla
        this.nonce = nonce;
    }

    signTransaction(privateKey?: string): string {
        const dataToSign = `${this.sender}${this.recipient}${this.amount}`;
        const signature = SHA256(dataToSign, privateKey).toString(enc.Hex);
        return signature;
    }
    verifySignature(publicKey?: string): boolean {
        const dataToSign = `${this.sender}${this.recipient}${this.amount}`;
        const computedSignature = SHA256(dataToSign, publicKey).toString(enc.Hex);
        return computedSignature === this.signature;
    }
}
