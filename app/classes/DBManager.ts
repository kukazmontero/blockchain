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
            console.log(`Block ${block.index}:`);
            console.log(`Index: ${block.index}`);
            console.log(`Timestamp: ${new Date(block.timestamp).toLocaleString()}`);
            console.log(`Previous Hash: ${block.previousHash}`);
            
            console.log("Transactions:");
            block.transactions.forEach((transaction, index) => {
                console.log(`    Transaction ${index + 1}:`);
                console.log(`    Sender: ${transaction.sender}`);
                console.log(`    Receiver: ${transaction.recipient}`);
                console.log(`    Amount: ${transaction.amount}`);
                console.log(`    Signature of the transaction ${index + 1}: ${transaction.signature}`);

                console.log(`    Valid Signature: ${transaction.valido}`);
            });

            console.log("\n");
        } else {
            console.log(`Block ${i} no find.`);
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
    return accountData;
  }
  async registerAccount2(data: string): Promise<string> {
    const account = JSON.parse(data);
    const accountData = JSON.stringify( account );
    await this.db.put(account.address, accountData);
    return accountData;
  }
  async registerAccountnotNode(new_account: string): Promise<string> {
    const accountData = new_account;
    await this.db.put(JSON.parse(new_account).address, accountData);
    return JSON.parse(accountData).address;
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