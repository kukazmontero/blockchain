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

  getTotalBlocks2= async (): Promise<String|null> => {
      try {
        const block_data = await this.db.iterator().all();
        const block:String = JSON.stringify(block_data);
        return block;
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

  async printBlocks(): Promise<string> {
    try {
      const totalBlocks = await this.getTotalBlocks();
      if (totalBlocks == null) return '';
  
      const formattedBlocks: any[] = [];
      for (let i = 0; i < totalBlocks; i++) {
        const block = await this.loadBlock(i);
  
        if (block) {
          const formattedBlock = {
            index: block.index,
            timestamp: new Date(block.timestamp).toLocaleString(),
            previousHash: block.previousHash,
            transactions: block.transactions.map((transaction, index) => ({
              index: index + 1,
              sender: transaction.sender,
              receiver: transaction.recipient,
              amount: transaction.amount,
              signature: transaction.signature,
              isValid: transaction.valido,
            })),
          };
  
          formattedBlocks.push(formattedBlock);
        } else {
          console.log(`Block ${i} not found.`);
        }
      }
  
      const jsonResult = JSON.stringify(formattedBlocks, null, 2);
      console.log(jsonResult); // Imprimir en consola para verificar antes de retornar
  
      return jsonResult;
    } catch (error) {
      console.error('Error retrieving blocks:', error);
      return JSON.stringify({ error: 'Internal server error' });
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

  async modifyState(address: string, blocked: boolean): Promise<void> {
    try {
      const account = await this.getAccountByAddress(address);
      
      if (account) {
        account.blocked = blocked;
        const accountData = JSON.stringify(account);
        await this.db.put(account.address, accountData);
      }
    } catch (error) {
      console.error('Error modifying account state:', error);
    }
  }
  async modifyMoney(address: string, amount: number): Promise<void> {
    try {
      const account = await this.getAccountByAddress(address);

      if (account) {
        // Realiza la modificación del saldo
        account.money += amount;

        // Guarda la cuenta modificada en la base de datos
        const accountData = JSON.stringify(account);
        await this.db.put(account.address, accountData);
      }
    } catch (error) {
      console.error('Error modifying money:', error);
    }
  }

  getTotalUsers= async (): Promise<String|null> => {
    try {
      const user_data = await this.db.iterator().all();
      const user:String = JSON.stringify(user_data);
      return user;
    } catch {
      return null;
    }
  }
  async saveUser(user: Account): Promise<void> {
    const userData = JSON.stringify(user);
    await this.db.put(user.address, userData);
  }
  
}