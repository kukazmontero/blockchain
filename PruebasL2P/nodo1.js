import { tcp } from '@libp2p/tcp';
import { multiaddr } from '@multiformats/multiaddr';
import { pipe } from 'it-pipe';
import all from 'it-all';
import fs from 'fs';
import { Level } from "level";


const port = process.argv[2];

const db_blocks = new DBBlocks(`./db/db_blocks_${port}.db`);
const db_accounts = new DBAccounts(`./db/db_accounts_${port}.db`);
import { promises as fsPromises, watch } from 'fs';
const dirPath = `./db/db_blocks_${port}.db`; 
const dirPath1 = `./db/db_accounts_${port}.db`; 

const n = 5;
let transactions = [];

const menu = async()=>{
    // while (true) {
      console.log("Menu:");
      console.log("1. Register account");
      console.log("2. Make transaction");
      console.log("3. Get account of address");
      console.log("4. View blocks");
      console.log("5. Exit");
  
      const choice = input.question('Enter Number Choice: ');
  
          if (choice == '1'){
            
            const name = input.question('Enter name for account: ');
            const message = name.toString().trim();
            const aux = await registerUser(db_accounts, message);
            const finalmessage = "1-" + aux;
            await sendFileToAllNodes(finalmessage);
            // break;
          }
          else if(choice == '2'){
            
            const sender_address = input.question('Input address sender: ');
            const recipient_address = input.question('Input address recipient: ');
            const amount = parseInt(input.question('Input amount: '));
            

            const sender = await db_accounts.getAccountByAddress(sender_address);
            const recipient = await db_accounts.getAccountByAddress(recipient_address);
            

            if(sender != null && recipient != null) {
                const transaction_generated = new Transaction(sender.name, recipient.name, amount, 1001, sender.privatekey, sender.publickey);
                console.log(transaction_generated);
                const last_block = await db_blocks.getLastBlock();
                console.log(last_block);
                // SI EL BLOQUE TIENE N TRANSACCIONES
                if(last_block) {
                  console.log(last_block?.transactions.length)
                  console.log(n)
                    if(last_block?.transactions.length == n) {
                        const block =  await generateBlock(last_block.index+1, last_block.hash, [transaction_generated])
                        const blockmessage = "2-"+ JSON.stringify(block);
                        await sendFileToAllNodes(blockmessage);
                        await db_blocks.saveBlock(block)
                    }
                    else {
                        last_block.transactions.push(transaction_generated);
                        const blockmessage = "2-"+ JSON.stringify(last_block);
                        await sendFileToAllNodes(blockmessage);
                        await db_blocks.saveBlock(last_block)
                    }
                }
            }
            
            // break;
          }
          else if (choice == '3'){
            const address = input.question('Enter address for get account: ');
            console.log(await db_accounts.getAccountByAddress(address));
            // break;
          }
          else if(choice == '4'){
            await db_blocks.printBlocks();
            // break;
          }
          else if (choice == '5'){
            console.log("Exiting...");
            return;
          }
          else{
            console.log("Not Valid Choice");
          }
  // }
}

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

        if(values.toString().split("_")[0] === "newconnection" && port != values.toString().split("_")[1]){
          await SyncContent(values.toString().split("_")[1]);

        }
        else if (values.toString().split("_")[0] === "sync"){
          const blocks = JSON.parse(values.toString().split("_")[1])
          for(const block of blocks){
            const addBlock = JSON.parse(block[1])
            db_blocks.saveBlock(addBlock);
          }
        }

        else if(values.toString().split("-")[0] == '1'){
          const new_acount = values.toString().split("-")[1];
          //console.log(new_acount)
          console.log(JSON.parse(await registerUser2(db_accounts, new_acount)));
        }
        else if(values.toString().split("-")[0] == '2'){
          const block = JSON.parse(values.toString().split("-")[1]);
          console.log(block)
          await db_blocks.saveBlock( block );
        

        }
        else if(values.toString().split("-")[0] == '0'){
          
          const newcontent = JSON.parse(values.toString().split("-")[1]);
          
          console.log(JSON.parse(await registerUser2(db_accounts, JSON.stringify(newcontent))));

        }

      }
    });

     // Registrar este nodo
     fs.appendFileSync('nodes.txt', `${this.addr.toString()}\n`);

    await listener.listen(this.addr);
    console.log('Listening on', this.addr.toString());
    const startmessage = `newconnection_${port}`;
    await sendFileToNode(startmessage);


    // Para enviar mensajes desde la línea de comandos
    process.stdin.on('data', async (data) => {
      await menu();
      process.stdin.resume();
    });
  }
}

async function SyncContent(dest) {
  // console.log(dest + (await db_blocks.getTotalBlocks2()));
  const fileContent = 'sync_'+(await db_blocks.getTotalBlocks2());
  // console.log(fileContent)
  const nodeAddr = `/ip4/127.0.0.1/tcp/${dest}` 
  // console.log(address)
  const transport = tcp()();
    const upgrader = {
      upgradeInbound: async maConn => maConn,
      upgradeOutbound: async maConn => maConn
    };

      const lastSlashIndex = nodeAddr.lastIndexOf('/');
      const portNumber = nodeAddr.substring(lastSlashIndex + 1);
      if(port != portNumber){
        const addr = multiaddr(nodeAddr);
        const socket = await transport.dial(addr, { upgrader });
        await pipe(
          [fileContent],
          socket
        );
        console.log(`File sent to ${addr.toString()}`);
      }

}

async function sendFileToAllNodes(fileContent) {
  // Utilizar tu mecanismo de comunicación para enviar el archivo a todos los nodos
  // Ejemplo:
  const nodes = fs.readFileSync('nodes.txt', 'utf-8').split('\n').filter(Boolean);
  // const nodes = [
  //   '/ip4/127.0.0.1/tcp/9000',
  //   '/ip4/127.0.0.1/tcp/9001',
  //   '/ip4/127.0.0.1/tcp/9002',
  // ];

  const transport = tcp()();
  const upgrader = {
    upgradeInbound: async maConn => maConn,
    upgradeOutbound: async maConn => maConn
  };

  for (const nodeAddr of nodes) {
    const lastSlashIndex = nodeAddr.lastIndexOf('/');
    const portNumber = nodeAddr.substring(lastSlashIndex + 1);
    if(port != portNumber){
      const addr = multiaddr(nodeAddr);
      const socket = await transport.dial(addr, { upgrader });
      await pipe(
        [fileContent],
        socket
      );
      console.log(`File sent to ${addr.toString()}`);
    }
  }
}
async function sendFileToNode(fileContent) {
  const nodes = fs.readFileSync('nodes.txt', 'utf-8').split('\n').filter(Boolean);
  const nodeAddr = nodes[0]
  const portdest = nodeAddr.toString().split("/")[4];

  if(fileContent.toString().split("_")[0]=== "newconnection" && portdest != fileContent.toString().split("_")[1]){
    const transport = tcp()();
    const upgrader = {
      upgradeInbound: async maConn => maConn,
      upgradeOutbound: async maConn => maConn
    };

      const lastSlashIndex = nodeAddr.lastIndexOf('/');
      const portNumber = nodeAddr.substring(lastSlashIndex + 1);
      if(port != portNumber){
        const addr = multiaddr(nodeAddr);
        const socket = await transport.dial(addr, { upgrader });
        await pipe(
          [fileContent],
          socket
        );
        console.log(`File sent to ${addr.toString()}`);
      }


  }

}

const node = new Node(port);
node.start();

import { Transaction } from "../app/classes/Transaction.js";
import { Block } from "../app/classes/Block.js";
import { Account } from "../app/classes/Account.js";
import { DBBlocks, DBAccounts } from "../app/classes/DBManager.js";
import * as input from 'readline-sync';
import { isAsyncFunction } from 'util/types';

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
const registerUser2 = async (db_accounts, name) => {
  return await db_accounts.registerAccount2(name);
};




if( await db_blocks.getTotalBlocks() == 0 && port==9000) {
  const origin_user = await registerUser(db_accounts, "Bob");
  const message = "0-"+origin_user;
  
  await sendFileToAllNodes(message);
  const origin_user_data = JSON.parse(origin_user);
  console.log(origin_user_data)
  

  if(origin_user_data) {
      const origin_transaction = new Transaction("origin", origin_user_data.name, 100, 10101, origin_user_data?.privatekey, origin_user_data?.publickey );
      const block = await generateBlock(0, "origin", [origin_transaction]) ;
      console.log(block)
      const blockmessage = "2-"+ JSON.stringify(block);
      await sendFileToAllNodes(blockmessage);
      await db_blocks.saveBlock( block );
  }
  const last_block = await db_blocks.getLastBlock();
  if(last_block) {
      const block = await generateBlock(last_block.index + 1, last_block.hash, transactions) ;
      console.log(block)
      const blockmessage = "2-"+ JSON.stringify(block);
      await sendFileToAllNodes(blockmessage);
      await db_blocks.saveBlock( block );
  }
}

    

