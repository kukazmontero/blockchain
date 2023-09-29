import { Transaction } from "./classes/Transaction";
import { Block } from "./classes/Block";
import { Level } from "level";

const db = new Level('db', { valueEncoding: 'json' });
const n = 5; //Transacciones por bloque

const generateBlock = (index: number, previousHash: string, transactions: Transaction[], nonce: number): Block => {
    return new Block( index, Date.now(), transactions, previousHash, nonce );
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
            console.log(`Nonce: ${block.nonce}`);
            
            console.log("Transacciones:");
            block.transactions.forEach((transaction, index) => {
                console.log(`  Transacción ${index + 1}:`);
                console.log(`    Remitente: ${transaction.sender}`);
                console.log(`    Destinatario: ${transaction.recipient}`);
                console.log(`    Monto: ${transaction.amount}`);
                //console.log(`    Hash de la Transacción: ${}`);
            });

            console.log("\n");
        } else {
            console.log(`Bloque ${i} no encontrado.`);
        }
    }
};


const main = async () => {
    //Bloque de Origen
    const genesisBlock = generateBlock(await getIndex(db), "", [new Transaction("Alice", "Bob", 100)], 13010390123);
    await saveBlock(db, genesisBlock);
    console.log("Bloque origen creado!");

    //---

    //Transacciones
    const transactions = [
        new Transaction("Bob", "Ana", 50),
        new Transaction("David", "Lukas", 100),
        new Transaction("Gabriel", "Rodrigo", 75),
        new Transaction("Benjamin", "Abel", 30),
        new Transaction("Bob", "Ana", 20),
        new Transaction("David", "Lukas", 10),
        new Transaction("Gabriel", "Rodrigo", 5),
        new Transaction("Benjamin", "Abel", 15),
        new Transaction("Bob", "Ana", 40),
        new Transaction("David", "Lukas", 25),
        new Transaction("Gabriel", "Rodrigo", 60),
        new Transaction("Benjamin", "Abel", 35),
        new Transaction("Bob", "Ana", 55),
        new Transaction("David", "Lukas", 90),
        new Transaction("Gabriel", "Rodrigo", 70),
        new Transaction("Benjamin", "Abel", 45),
        new Transaction("Bob", "Ana", 80),
        new Transaction("David", "Lukas", 10)
    ];


    let ArregloDeTransacciones: Transaction[] = [];

    for (let i = 0; i < transactions.length; i++) {
        ArregloDeTransacciones.push(transactions[i]);

        //Cuando el arreglo de transacciones sea igual a n, Ó sea la ultima iteracion, entonces 
        if (ArregloDeTransacciones.length === n || i === transactions.length - 1) {
            const previousBlock = await loadBlock(db, await getIndex(db) - 1);
            const newBlock = generateBlock(await getIndex(db), previousBlock?.hash || "", ArregloDeTransacciones, 13010390123);
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