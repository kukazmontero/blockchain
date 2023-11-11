import { Level } from "level";
import { Block } from "./Block";
import { Transaction } from "./Transaction";
import { Account } from "./Account";

export class DBBlocks {
  private db: Level;

  constructor(dbPath: string) {
    this.db = new Level(dbPath, { valueEncoding: 'json' });
  }

  async getTotalBlocks(): Promise<number | null> {
    try {
        return (await this.db.iterator().all()).length;
    } catch {
      return null;
    }
  }

  getLastBlock = async (): Promise<Block|null> => {
    try {
        const index = await this.getTotalBlocks();
        if(index != null) {
          const last_block_data = await this.db.get(`block-${ index - 1 }`);
          const last_block:Block = JSON.parse(last_block_data);
          return last_block;
        }
        return null;
    } catch {
        return null;
    }
  }

  async saveBlock(block: Block): Promise<void> {
    const blockData = JSON.stringify(block);
    await this.db.put(`block-${block.index}`, blockData);
  }

  async loadBlock(index: number): Promise<Block | null> {
    try {
        const blockData = await this.db.get(`block-${index}`);
        const block: Block = JSON.parse(blockData);
        return block;
    } catch(error) {
        return null;
    }
  }

  async printBlocks(): Promise<void> {
    const totalBlocks = await this.getTotalBlocks();
    if(totalBlocks == null) return;

    for (let i = 0; i < totalBlocks; i++) {
        const block = await this.loadBlock(i);

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
  }
}

export class DBAccounts {
  private db: Level;

  constructor(dbPath: string) {
    this.db = new Level(dbPath, { valueEncoding: 'json' });
  }

  async getTotalAccounts(): Promise<number | null> {
    try {
        return (await this.db.iterator().all()).length;
    } catch {
      return null;
    }
  }

  async registerAccount(name: string): Promise<string> {
    const account = new Account(name);
    const accountData = JSON.stringify( account );
    await this.db.put(account.address, accountData);
    return account.address;
  }

  async getAccountByAddress(address: string): Promise<Account | null> {
    try {
      return await JSON.parse(await this.db.get(address));
    } catch  {
        return null;
    }
  }

  async printAccounts(): Promise<void> {
    const totalAccounts = await this.getTotalAccounts();
    if(totalAccounts == null) return;

    const accounts = await this.db.keys().all();

    accounts.map(async (element) => {
      console.log( await this.getAccountByAddress(element) );
    })
  }
}