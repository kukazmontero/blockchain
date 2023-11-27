import { tcp } from '@libp2p/tcp';
import { multiaddr } from '@multiformats/multiaddr';
import { pipe } from 'it-pipe';
import all from 'it-all';
// import fs from 'fs';

const port = process.argv[2];
if (!port) {
  console.log("Usage: node script.js <port>");
  process.exit(1);
}

class Node {
  constructor(port) {
    this.addr = multiaddr(`/ip4/127.0.0.1/tcp/${port}`);
    this.transport = tcp()();
    this.upgrader = {
      upgradeInbound: async maConn => maConn,
      upgradeOutbound: async maConn => maConn
    };
  }

  async start() {
    const listener = this.transport.createListener({
      upgrader: this.upgrader,
      handler: async (socket) => {
        console.log('new connection opened');
        const values = await pipe(
          socket,
          all
        );
        console.log(`Received: ${values.toString()}`);
        if(values.toString().split("-")[0] == '1'){
          const name = values.toString().split("-")[1];
          const new_acount = values.toString().split("-")[2];
          console.log(await registerUsernotNode(db_accounts, new_acount));
        }
      }
    });

    await listener.listen(this.addr);
    console.log('Listening on', this.addr.toString());

    // Registrar este nodo
    // fs.appendFileSync('nodes.txt', `${this.addr.toString()}\n`);
  }
}

async function sendMessageToAll(message) {
  // const nodes = fs.readFileSync('nodes.txt', 'utf-8').split('\n').filter(Boolean);
  const nodes =  [
    '/ip4/127.0.0.1/tcp/9000',
    '/ip4/127.0.0.1/tcp/9001',
    '/ip4/127.0.0.1/tcp/9002',
  ]  
  const transport = tcp()();
  const upgrader = {
    upgradeInbound: async maConn => maConn,
    upgradeOutbound: async maConn => maConn
  };

  for (const nodeAddr of nodes) {
    const addr = multiaddr(nodeAddr);
    const socket = await transport.dial(addr, { upgrader });
    await pipe(
      [message],
      socket
    );
    console.log(`Message sent to ${addr.toString()}:`, message);
  }
}

const node = new Node(port);
node.start();

import { Transaction } from "../app/classes/Transaction.js";
import { Block } from "../app/classes/Block.js";
import { Account } from "../app/classes/Account.js";
import { DBBlocks, DBAccounts } from "../app/classes/DBManager.js";
import * as input from 'readline-sync';

const generateBlock = (index, previousHash, transactions) => {
    return new Block(index, Date.now(), transactions, previousHash);
};

const generateUniqueAccounts = (numberOfAccounts) => {
    const accounts = [];

    for (let i = 0; i < numberOfAccounts; i++) {
        const account = new Account("");
        accounts.push(account);
    }

    return accounts;
};

const registerUser = async (db_accounts, name) => {
    return await db_accounts.registerAccount(name);
};
const registerUsernotNode = async (db_accounts, new_account) => {
  return await db_accounts.registerAccountnotNode(new_account);
}
const db_blocks = new DBBlocks(`./db/db_blocks_${port}.db`);
const db_accounts = new DBAccounts(`./db/db_accounts_${port}.db`);

const n = 5;
let transactions = [];

    

// Para enviar mensajes desde la línea de comandos
process.stdin.on('data', async (data) => {
  while (true) {
    console.log("Menu:");
    console.log("1. Register account");
    console.log("2. Make transaction");
    console.log("3. Get account of address");
    console.log("4. View blocks");
    console.log("5. Exit");

    const choice = input.question('Enter Number Choice: ');

    switch (choice) {
        case '1':
            const name = input.question('Enter name for account: ');
            const message = name.toString().trim();
            const aux = await registerUser(db_accounts, message);
            const finalmessage = "1-" + message + "-" + aux.toString().trim();
            await sendMessageToAll(finalmessage);
            break;
        case '2':
            const sender_address = input.question('Input address sender: ');
            const recipient_address = input.question('Input address recipient: ');
            const amount = parseInt(input.question('Input amount: '));
            const content_transaction = "2-" + sender_address + "-" + recipient_address + "-" + amount;
            await sendMessageToAll(content_transaction);

            const sender = await db_accounts.getAccountByAddress(sender_address);
            const recipient = await db_accounts.getAccountByAddress(recipient_address);
            

            if(sender != null && recipient != null) {
                const transaction_generated = new Transaction(sender.name, recipient.name, amount, 1001, sender.privatekey, sender.publickey);
                
                const last_block = await db_blocks.getLastBlock();
                // SI EL BLOQUE TIENE N TRANSACCIONES
                if(last_block) {
                    if(last_block?.transactions.length == n) {
                        console.log(await db_blocks.saveBlock(await generateBlock(last_block.index+1, last_block.hash, [transaction_generated])));
                    }
                    else {
                        last_block.transactions.push(transaction_generated);
                        console.log(db_blocks.saveBlock(last_block));
                    }
                }
            }
            
            break;
        case '3':
            const address = input.question('Enter address for get account: ');
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

  
});
