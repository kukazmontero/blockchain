import { Transaction } from "./Transaction";
import { SHA256 } from "crypto-js";

export class Block {
    public index: number;
    public timestamp: number;
    public transactions: Transaction[];
    public previousHash: string;
    public hash: string;
    

    constructor(index: number, timestamp: number, transactions: Transaction[], previousHash: string){
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash = (): string => {
    
        let data = `${this.index}${this.timestamp}${this.previousHash}`;
    
        this.transactions.forEach((transaction) => {
            const {sender, recipient, amount} = transaction;
            data += `${sender}${recipient}${amount}`;
        })
    
        return SHA256(data).toString();
    }
}