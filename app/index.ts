import { Transaction } from "./classes/Transaction";
import { Block } from "./classes/Block";
import { Level } from "level";

const db = new Level('db', { valueEncoding: 'json' });

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

const main = async () => {
    const block1 = generateBlock( await getIndex(db), "aaa111", [new Transaction("Bob", "Ana", 50), new Transaction("Eli", "bet", 100)], 13010390123 );
    await saveBlock(db, block1);
    const block_response1 = await loadBlock(db, 0);
    console.log(JSON.stringify(block_response1));

    const block2 = generateBlock( await getIndex(db), "aaa111", [new Transaction("Bob", "Ana", 50), new Transaction("Eli", "bet", 100)], 13010390123 );
    await saveBlock(db, block2);
    const block_response2 = await loadBlock(db, 1);
    console.log(JSON.stringify(block_response2));

    const block3 = generateBlock( await getIndex(db), "aaa111", [new Transaction("Bob", "Ana", 50), new Transaction("Eli", "bet", 100)], 13010390123 );
    await saveBlock(db, block3);
    const block_response3 = await loadBlock(db, 2);
    console.log(JSON.stringify(block_response3));

    const block4 = generateBlock( await getIndex(db), "aaa111", [new Transaction("Bob", "Ana", 50), new Transaction("Eli", "bet", 100)], 13010390123 );
    await saveBlock(db, block4);
    const block_response4 = await loadBlock(db, 3);
    console.log(JSON.stringify(block_response4));
    
}

main();