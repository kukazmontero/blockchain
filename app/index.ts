import { Transaction } from "./classes/Transaction";
import { Block } from "./classes/Block";
import { Account } from "./classes/Account";
import { Level } from "level";
import { DBBlocks, DBAccounts } from "./classes/DBManager";
import * as input from 'readline-sync';

const generateBlock = (index: number, previousHash: string, transactions: Transaction[]): Block => {
    return new Block( index, Date.now(), transactions, previousHash );
};

const generateUniqueAccounts = (numberOfAccounts: number): Account[] => {
    const accounts: Account[] = [];

    for (let i = 0; i < numberOfAccounts; i++) {
        const account = new Account("");
        accounts.push(account);

    }

    return accounts;
};


const registerUser = async(db_accounts: DBAccounts, name:string): Promise<string> => {
    return await db_accounts.registerAccount(name);
}

const main = async () => {
    const db_blocks = new DBBlocks("./db/db_blocks.db");
    const db_accounts = new DBAccounts("./db/db_accounts.db");
    const n = 5;
    let transactions: Transaction[] = Array<Transaction>();

    // REGISTRAR CUENTA
    console.log(await registerUser(db_accounts, "Rodrigo"));
    
    // OBTENER CUENTA
    // console.log( await db_accounts.getAccountByAddress("0x5fbEf9d584a2317FF48CD328086F648bAb19C989") );

    // BLOQUE ORIGEN
    if( await db_blocks.getTotalBlocks() == 0 ) {
        const origin_user_address = await registerUser(db_accounts, "Bob");
        const origin_user_data = await db_accounts.getAccountByAddress(origin_user_address);
    
        if(origin_user_data) {
            const origin_transaction = new Transaction("origin", origin_user_data.name, 100, 10101, origin_user_data?.privatekey, origin_user_data?.publickey );
            
            await db_blocks.saveBlock( await generateBlock(0, "origin", [origin_transaction]) );
        }
        const last_block = await db_blocks.getLastBlock();
        if(last_block) {
            await db_blocks.saveBlock( await generateBlock(last_block.index + 1, last_block.hash, Array<Transaction>()) )
        }
    }

    // TRANSACCION
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

    await db_blocks.printBlocks();


    // const sender_address = input.question('Input address sender: ');
    // const recipient_address = input.question('Input address recipient: ');
    // const amount = parseInt(input.question('Input amount: '));

    // const sender = await db_accounts.getAccountByAddress(sender_address);
    // const recipient = await db_accounts.getAccountByAddress(recipient_address);

    // if(sender != null && recipient != null) {
    //     const transaction_generated = new Transaction(sender.name, recipient.name, amount, 1001, sender.privatekey, sender.publickey);

    //     if(transactions.length < n) {
    //         transactions.push( transaction_generated );
    //     }
    //     else {
    //         const index = await db_blocks.getTotalBlocks();
    //         if(index != null) {
    //             const previousBlock = await db_blocks.loadBlock(index - 1);
    //             if(previousBlock != null) {
    //                 const block = generateBlock(index, previousBlock?.hash, transactions);
    //                 db_blocks.saveBlock(block);
    //                 transactions = Array<Transaction>();
    //             }
    //         }
    //     }
    // }

    



    // const numberOfAccounts = 5; // Número de usuarios participantes
    // const accounts = generateUniqueAccounts(numberOfAccounts);
    // // Acceder a las claves de la primera cuenta
    // const primeraCuenta = accounts[0];
    // const privateKeyCuentaAlice = primeraCuenta.privatekey;
    // const publicKeyCuentaAlice = primeraCuenta.publickey;

    // // Acceder a las claves de la segunda cuenta
    // const segundaCuenta = accounts[1];
    // const privateKeyCuentaBob = segundaCuenta.privatekey;
    // const publicKeyCuentaBob = segundaCuenta.publickey;
    // // Acceder a las claves de la tercera cuenta
    // const terceraCuenta = accounts[2];
    // const privateKeyCuentaDavid = terceraCuenta.privatekey;
    // const publicKeyCuentaDavid = terceraCuenta.publickey;
    // // Acceder a las claves de la cuarta cuenta
    // const cuartaCuenta = accounts[3];
    // const privateKeyCuentaGabriel = cuartaCuenta.privatekey;
    // const publicKeyCuentaGabriel = cuartaCuenta.publickey;
    // // Acceder a las claves de la quinta cuenta
    // const quintaCuenta = accounts[4];
    // const privateKeyCuentaBenjamin = quintaCuenta.privatekey;
    // const publicKeyCuentaBenjamin = quintaCuenta.publickey;


    // //Bloque de Origen
    // const index = await db_blocks.getIndex();
    // if(index == 0) {
    //     const genesisBlock = generateBlock(index, "", [new Transaction("Alice", "Bob", 100, 111, privateKeyCuentaAlice, publicKeyCuentaAlice)]);
    //     await db_blocks.saveBlock(genesisBlock);
    //     console.log("Bloque origen creado!");
    // }

    // const transactions = [
    //     new Transaction("Bob", "Ana", 50, 111, privateKeyCuentaBob, publicKeyCuentaBob),
    //     new Transaction("David", "Lukas", 100, 111, privateKeyCuentaDavid, publicKeyCuentaDavid),
    //     new Transaction("Gabriel", "Rodrigo", 75, 111, privateKeyCuentaGabriel, publicKeyCuentaGabriel),
    //     new Transaction("Benjamin", "Abel", 30, 111, privateKeyCuentaBenjamin, publicKeyCuentaBenjamin),
    //     new Transaction("Bob", "Ana", 20,111, privateKeyCuentaBob, publicKeyCuentaBob),
    //     new Transaction("David", "Lukas", 10, 111, privateKeyCuentaDavid, publicKeyCuentaDavid),
    //     new Transaction("Gabriel", "Rodrigo", 5, 111, privateKeyCuentaGabriel, publicKeyCuentaGabriel),
    //     new Transaction("Benjamin", "Abel", 15, 111, privateKeyCuentaBenjamin, publicKeyCuentaBenjamin),
    //     new Transaction("Bob", "Ana", 40,111, privateKeyCuentaBob, publicKeyCuentaBob),
    //     new Transaction("David", "Lukas", 25, 111, privateKeyCuentaDavid, publicKeyCuentaDavid),
    //     new Transaction("Gabriel", "Rodrigo", 60, 111, privateKeyCuentaGabriel, publicKeyCuentaGabriel),
    //     new Transaction("Benjamin", "Abel", 35, 111, privateKeyCuentaBenjamin, publicKeyCuentaBenjamin),
    //     new Transaction("Bob", "Ana", 55, 111, privateKeyCuentaBob, publicKeyCuentaBob),
    //     new Transaction("David", "Lukas", 90, 111, privateKeyCuentaDavid, publicKeyCuentaDavid),
    //     new Transaction("Gabriel", "Rodrigo", 70, 111, privateKeyCuentaGabriel, publicKeyCuentaGabriel),
    //     new Transaction("Benjamin", "Abel", 45,111, privateKeyCuentaBenjamin, publicKeyCuentaBenjamin),
    //     new Transaction("Bob", "Ana", 80, 111, privateKeyCuentaBob, publicKeyCuentaBob),
    //     new Transaction("David", "Lukas", 10, 111, privateKeyCuentaDavid, publicKeyCuentaDavid)
    // ];

    // let ArregloDeTransacciones: Transaction[] = [];

    // for (let i = 0; i < transactions.length; i++) {
    //     ArregloDeTransacciones.push(transactions[i]);

    //     //Cuando el arreglo de transacciones sea igual a n, Ó sea la ultima iteracion, entonces 
    //     if (ArregloDeTransacciones.length === n || i === transactions.length - 1) {
    //         const index = await db_blocks.getIndex();
    //         if(index == null) continue;
    //         const previousBlock = await db_blocks.loadBlock(index - 1);
    //         const newBlock = generateBlock(index, previousBlock?.hash || "", ArregloDeTransacciones);
    //         await db_blocks.saveBlock(newBlock);
    //         //console.log(`Bloque ${newBlock.index} creado:`);

    //         //Limpio el arreglo de transacciones
    //         ArregloDeTransacciones = [];
    //     }
    // }

    // console.log("\nBloques Almacenados:\n");
    // await db_blocks.printBlocks();
}

main();