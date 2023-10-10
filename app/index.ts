import { Transaction } from "./classes/Transaction";
import { Block } from "./classes/Block";
import { Cuenta } from "./classes/Account";
import { Level } from "level";

const db = new Level('db', { valueEncoding: 'json' });
const n = 5; //Transacciones por bloque

const generateBlock = (index: number, previousHash: string, transactions: Transaction[]): Block => {
    return new Block( index, Date.now(), transactions, previousHash );
};

const getIndex = async (db: any) => {
    return (await db.iterator().all()).length;
}

const saveBlock = async (db: any, block: Block) => {
    const blockData = JSON.stringify(block);

    await db.put(`block-${block.index}`, blockData);
}

const loadBlock = async (db: any, index: number): Promise<Block | null> => {
    try {
        const blockData = await db.get(`block-${index}`);
        const block: Block = JSON.parse(blockData);
        return block;
    } catch(error) {
        return null;
    }
}

const printBlocks = async () => {
    const totalBlocks = await getIndex(db);

    for (let i = 0; i < totalBlocks; i++) {
        const block = await loadBlock(db, i);

        if (block) {
            console.log(`Bloque ${block.index}:`);
            console.log(`Índice: ${block.index}`);
            console.log(`Marca de tiempo: ${new Date(block.timestamp).toLocaleString()}`);
            console.log(`Hash anterior: ${block.previousHash}`);
            
            console.log("Transacciones:");
            block.transactions.forEach((transaction, index) => {
                console.log(`    Transacción ${index + 1}:`);
                console.log(`    Remitente: ${transaction.sender}`);
                console.log(`    Destinatario: ${transaction.recipient}`);
                console.log(`    Monto: ${transaction.amount}`);
                console.log(`    Firma de la Transacción ${index + 1}: ${transaction.signature}`);

                console.log(`Firma válida: ${transaction.valido}`);
            });

            console.log("\n");
        } else {
            console.log(`Bloque ${i} no encontrado.`);
        }
    }
};

const generateUniqueAccounts = (numberOfAccounts: number): Cuenta[] => {
    const accounts: Cuenta[] = [];

    for (let i = 0; i < numberOfAccounts; i++) {
        const account = new Cuenta();
        account.generarMnemonica();
        account.generarDireccion();
        account.generarClaves();
        accounts.push(account);

    }

    return accounts;
};

const main = async () => {
    const numberOfAccounts = 5; // Número de usuarios participantes
    const accounts = generateUniqueAccounts(numberOfAccounts);
    // Acceder a las claves de la primera cuenta
    const primeraCuenta = accounts[0];
    const privateKeyCuentaAlice = primeraCuenta.obtenerClavePrivada();
    const publicKeyCuentaAlice = primeraCuenta.obtenerClavePublica();

    // Acceder a las claves de la segunda cuenta
    const segundaCuenta = accounts[1];
    const privateKeyCuentaBob = segundaCuenta.obtenerClavePrivada();
    const publicKeyCuentaBob = segundaCuenta.obtenerClavePublica();
    // Acceder a las claves de la tercera cuenta
    const terceraCuenta = accounts[2];
    const privateKeyCuentaDavid = terceraCuenta.obtenerClavePrivada();
    const publicKeyCuentaDavid = terceraCuenta.obtenerClavePublica();
    // Acceder a las claves de la cuarta cuenta
    const cuartaCuenta = accounts[3];
    const privateKeyCuentaGabriel = cuartaCuenta.obtenerClavePrivada();
    const publicKeyCuentaGabriel = cuartaCuenta.obtenerClavePublica();
    // Acceder a las claves de la quinta cuenta
    const quintaCuenta = accounts[4];
    const privateKeyCuentaBenjamin = quintaCuenta.obtenerClavePrivada();
    const publicKeyCuentaBenjamin = quintaCuenta.obtenerClavePublica();


    //Bloque de Origen
    const genesisBlock = generateBlock(await getIndex(db), "", [new Transaction("Alice", "Bob", 100, 111, privateKeyCuentaAlice, publicKeyCuentaAlice)]);
    await saveBlock(db, genesisBlock);
    console.log("Bloque origen creado!");


    

    const transactions = [
        new Transaction("Bob", "Ana", 50, 111, privateKeyCuentaBob, publicKeyCuentaBob),
        new Transaction("David", "Lukas", 100, 111, privateKeyCuentaDavid, publicKeyCuentaDavid),
        new Transaction("Gabriel", "Rodrigo", 75, 111, privateKeyCuentaGabriel, publicKeyCuentaGabriel),
        new Transaction("Benjamin", "Abel", 30, 111, privateKeyCuentaBenjamin, publicKeyCuentaBenjamin),
        new Transaction("Bob", "Ana", 20,111, privateKeyCuentaBob, publicKeyCuentaBob),
        new Transaction("David", "Lukas", 10, 111, privateKeyCuentaDavid, publicKeyCuentaDavid),
        new Transaction("Gabriel", "Rodrigo", 5, 111, privateKeyCuentaGabriel, publicKeyCuentaGabriel),
        new Transaction("Benjamin", "Abel", 15, 111, privateKeyCuentaBenjamin, publicKeyCuentaBenjamin),
        new Transaction("Bob", "Ana", 40,111, privateKeyCuentaBob, publicKeyCuentaBob),
        new Transaction("David", "Lukas", 25, 111, privateKeyCuentaDavid, publicKeyCuentaDavid),
        new Transaction("Gabriel", "Rodrigo", 60, 111, privateKeyCuentaGabriel, publicKeyCuentaGabriel),
        new Transaction("Benjamin", "Abel", 35, 111, privateKeyCuentaBenjamin, publicKeyCuentaBenjamin),
        new Transaction("Bob", "Ana", 55, 111, privateKeyCuentaBob, publicKeyCuentaBob),
        new Transaction("David", "Lukas", 90, 111, privateKeyCuentaDavid, publicKeyCuentaDavid),
        new Transaction("Gabriel", "Rodrigo", 70, 111, privateKeyCuentaGabriel, publicKeyCuentaGabriel),
        new Transaction("Benjamin", "Abel", 45,111, privateKeyCuentaBenjamin, publicKeyCuentaBenjamin),
        new Transaction("Bob", "Ana", 80, 111, privateKeyCuentaBob, publicKeyCuentaBob),
        new Transaction("David", "Lukas", 10, 111, privateKeyCuentaDavid, publicKeyCuentaDavid)
    ];

    let ArregloDeTransacciones: Transaction[] = [];

    for (let i = 0; i < transactions.length; i++) {
        ArregloDeTransacciones.push(transactions[i]);

        //Cuando el arreglo de transacciones sea igual a n, Ó sea la ultima iteracion, entonces 
        if (ArregloDeTransacciones.length === n || i === transactions.length - 1) {
            const previousBlock = await loadBlock(db, await getIndex(db) - 1);
            const newBlock = generateBlock(await getIndex(db), previousBlock?.hash || "", ArregloDeTransacciones);
            await saveBlock(db, newBlock);
            //console.log(`Bloque ${newBlock.index} creado:`);

            //Limpio el arreglo de transacciones
            ArregloDeTransacciones = [];
        }
    }

    console.log("\nBloques Almacenados:\n");
    await printBlocks();
}

main();