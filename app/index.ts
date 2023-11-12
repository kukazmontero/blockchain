import { Transaction } from "./classes/Transaction";
import { Block } from "./classes/Block";
import { Account } from "./classes/Account";
import { Level } from "level";
import { DBBlocks, DBAccounts } from "./classes/DBManager";
import * as input from 'readline-sync';

const generateBlock = (index: number, previousHash: string, transactions: Transaction[]): Block => {
    return new Block(index, Date.now(), transactions, previousHash);
};

const generateUniqueAccounts = (numberOfAccounts: number): Account[] => {
    const accounts: Account[] = [];

    for (let i = 0; i < numberOfAccounts; i++) {
        const account = new Account("");
        accounts.push(account);
    }

    return accounts;
};

const registerUser = async (db_accounts: DBAccounts, name: string): Promise<string> => {
    return await db_accounts.registerAccount(name);
}

const main = async () => {
    const db_blocks = new DBBlocks("./db/db_blocks.db");
    const db_accounts = new DBAccounts("./db/db_accounts.db");
    const n = 5;
    let transactions: Transaction[] = Array<Transaction>();

    while (true) {
        console.log("Menu:");
        console.log("1. Register account");
        console.log("2. Make transaction");
        console.log("3. Get account of address");
        console.log("4. View blocks")
        console.log("5. Exit");

        const choice = input.question('Enter Number Choice: ');

        switch (choice) {
            case '1':
                const name = input.question('Enter name for account: ');
                console.log(await registerUser(db_accounts, name));
                break;
            case '2':
                const sender_address = input.question('Input address sender: ');
                const recipient_address = input.question('Input address recipient: ');
                const amount = parseInt(input.question('Input amount: '));

                const sender = await db_accounts.getAccountByAddress(sender_address);
                const recipient = await db_accounts.getAccountByAddress(recipient_address);

                if(sender != null && recipient != null) {
                    const transaction_generated = new Transaction(sender.name, recipient.name, amount, 1001, sender.privatekey, sender.publickey);
                    
                    const last_block = await db_blocks.getLastBlock();
                    // SI EL BLOQUE TIENE N TRANSACCIONES
                    if(last_block) {
                        if(last_block?.transactions.length == n) {
                            await db_blocks.saveBlock(await generateBlock(last_block.index+1, last_block.hash, [transaction_generated]));
                        }
                        else {
                            last_block.transactions.push(transaction_generated)
                            db_blocks.saveBlock(last_block);
                        }
                    }
                }
                break;
            case '3':
                const address = input.question('Enter address for get acoount: ');
                console.log(await db_accounts.getAccountByAddress(address));
                break;
            case '4':
                await db_blocks.printBlocks();
                break;
            case '5':
                console.log("Exiting...");
                return;
            default:
                console.log("Not Valid Choice");
        }
    }
}

main();
