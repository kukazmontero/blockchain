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

import express from 'express';
const app = express();
app.use(express.json()); 


let chain = [];
let accounts = [];

app.get('/menu', (req, res) => {
  const menu = {
    menuItems: [
      'Register account -> POST /account + JSON',
      'Make transaction -> POST /transaction + JSON',
      'Get account of address -> POST /account/#address',
      'View blocks -> GET /blocks',
      'Exit -> GET /exit'
    ]
  };

  res.json(menu);
});

app.post('/account', async (req, res) => {
  try {
    let name;

    // Verificar si la solicitud proviene de la API o de la consola
    if (req.body) {
      // Si es una solicitud API
      name = req.body.name;
    } else {
      // Si es entrada por consola
      name = input.question('Enter name for account: ');
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const newAccount = await registerUser(db_accounts, name);

    const finalmessage = "1-" + newAccount;
    await sendFileToAllNodes(finalmessage);

    // Convertir la cadena JSON a un objeto JavaScript
    const newAccountObj = JSON.parse(newAccount);
    console.log('New Account:', newAccountObj);
    accounts.push(newAccountObj);


    // Devolver el resultado en formato JSON
    res.status(201).json({
      success: true,
      account: {
        name: newAccountObj.name,
        mnemonic: newAccountObj.mnemonic,
        wallet: {
          _isSigner: true,
          address: newAccountObj.wallet.address,
          provider: null
        },
        address: newAccountObj.address,
        privatekey: newAccountObj.privatekey,
        publickey: newAccountObj.publickey,
        money: newAccountObj.money,
        blocked: newAccountObj.blocked
      }
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/transaction', async (req, res) => {
  try {
    let senderAddress, recipientAddress, amount;

    // Verificar si la solicitud proviene de la API o de la consola
    if (req.body) {
      // Si es una solicitud API
      senderAddress = req.body.senderAddress;
      recipientAddress = req.body.recipientAddress;
      amount = req.body.amount;
    } else {
      // Si es entrada por consola
      senderAddress = input.question('Input address sender: ');
      recipientAddress = input.question('Input address recipient: ');
      amount = parseInt(input.question('Input amount: '));
    }

    const sender = await db_accounts.getAccountByAddress(senderAddress);
    const recipient = await db_accounts.getAccountByAddress(recipientAddress);

    if (!sender || !recipient) {
      return res.status(400).json({ error: 'Invalid sender or recipient address' });
    }

    if (sender.blocked) {
      return res.status(400).json({ error: 'Sender account is blocked.' });
    }

    // Verificar si el remitente tiene suficiente dinero
    if (sender.money < amount) {
      return res.status(400).json({ error: 'Insufficient funds in the sender account.' });
    }

    // Modificar el estado del sender a blocked antes de realizar la transacción
    await db_accounts.modifyState(senderAddress, true);

    // Descontar el monto de la cuenta del remitente
    await db_accounts.modifyMoney(senderAddress, -amount);

    // Aumentar el monto en la cuenta del destinatario
    await db_accounts.modifyMoney(recipientAddress, amount);


    // Verificar si es necesario crear un nuevo bloque
    const lastBlock = await db_blocks.getLastBlock();
    const transactions = lastBlock ? lastBlock.transactions : [];

    const transaction = new Transaction(
      sender.name,
      recipient.name,
      amount,
      Date.now(),
      sender.privatekey,
      sender.publickey
    );

    if (lastBlock && lastBlock.transactions.length === 5) {
      const newBlock = generateBlock(
        lastBlock.index + 1,
        lastBlock.hash,
        [transaction]
      );
      chain.push(newBlock);
      await sendFileToAllNodes("2-" + JSON.stringify(newBlock));
      await db_blocks.saveBlock(newBlock);
    } else {
      transactions.push(transaction);
      const blockmessage = "2-" + JSON.stringify(lastBlock);
      await sendFileToAllNodes(blockmessage);
      await db_blocks.saveBlock(lastBlock);
    }

    // Modificar el estado del sender a unblocked después de realizar la transacción
    await db_accounts.modifyState(senderAddress, false);

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Modifica el endpoint para obtener una cuenta por dirección
app.get('/account/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validar que se haya proporcionado una dirección
    if (!address) {
      return res.status(400).json({ error: 'Address is required.' });
    }

    const account = await db_accounts.getAccountByAddress(address);

    // Verificar si la cuenta fue encontrada
    if (account) {
      // Devolver el resultado en formato JSON
      res.status(200).json({
        success: true,
        account: {
          name: account.name,
          mnemonic: account.mnemonic,
          wallet: {
            _isSigner: true,
            address: account.wallet.address,
            provider: null
          },
          address: account.address,
          privatekey: account.privatekey,
          publickey: account.publickey,
          money: account.money,
          blocked: account.blocked
        }
      });
    } else {
      // Si la cuenta no se encuentra, devolver un mensaje de error
      res.status(404).json({ error: 'Account not found.' });
    }
  } catch (error) {
    console.error('Error retrieving account by address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/blocks', async (req, res) => {
  try {
    const blocks = await db_blocks.printBlocks();
    
    const parsedBlocks = JSON.parse(blocks);
    res.json({ success: true, blocks: parsedBlocks });
  } catch (error) {
    console.error('Error retrieving blocks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/exit', (req, res) => {
  console.log("Exiting...");
  process.exit(0);
});


app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});


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
    this.nodesFilePath = 'nodes.txt';
  }

  async start() {
    try {
      // Verificar si el archivo 'nodes.txt' existe, y crearlo si no
      if (!fs.existsSync(this.nodesFilePath)) {
        fs.writeFileSync(this.nodesFilePath, ''); // Puedes dejarlo vacío por ahora
      }
  
      const listener = this.transport.createListener({
        upgrader: this.upgrader,
        handler: async (socket) => {
          console.log('new connection opened');
          const values = await pipe(
            socket,
            all
          );
  
          if (values.toString().split("_")[0] === "newconnection" && port != values.toString().split("_")[1]) {
            await SyncContent(values.toString().split("_")[1]);
          } else if (values.toString().split("°")[0] === "sync") {
            const blocks = JSON.parse(values.toString().split("°")[1]);
            for (const block of blocks) {
              const addBlock = JSON.parse(block[1]);
              db_blocks.saveBlock(addBlock);
            }
            const users = JSON.parse(values.toString().split("°")[2]);
            for (const user of users) {
              const addUser = JSON.parse(user[1]);
              db_accounts.saveUser(addUser);
            }
          } else if (values.toString().split("-")[0] == '1') {
            const new_acount = values.toString().split("-")[1];
            console.log(JSON.parse(await registerUser2(db_accounts, new_acount)));
          } else if (values.toString().split("-")[0] == '2') {
            const block = JSON.parse(values.toString().split("-")[1]);
            console.log(block);
            await db_blocks.saveBlock(block);
          } else if (values.toString().split("-")[0] == '0') {
            const newcontent = JSON.parse(values.toString().split("-")[1]);
            console.log(JSON.parse(await registerUser2(db_accounts, JSON.stringify(newcontent))));
          }
  
          if (socket && typeof socket.on === 'function') {
            socket.on('close', () => {
              // Código de manejo del evento close
              this.removeNodeFromList();
              console.log('La conexión se cerró.');
            });
          } else {
            console.error('Socket does not have the expected methods.');
          }
        }
      });
  
      // Verificar si la dirección ya está en la lista antes de registrar este nodo
      const nodes = fs.readFileSync(this.nodesFilePath, 'utf-8').split('\n').filter(Boolean);
      if (!nodes.includes(this.addr.toString())) {
        // Si la dirección no está presente, registrar este nodo
        fs.appendFileSync(this.nodesFilePath, `${this.addr.toString()}\n`);
      }
  
      await listener.listen(this.addr);
      console.log('Listening on', this.addr.toString());
      const startmessage = `newconnection_${port}`;
      await sendFileToNode(startmessage);
  
      // Para enviar mensajes desde la línea de comandos
      process.stdin.on('data', async (data) => {
        await menu();
      });
    } catch (error) {
      console.error('Error during node start:', error);
    }
  }
  

  removeNodeFromList() {
    // Leer la lista de nodos actual del archivo
    const nodes = fs.readFileSync(this.nodesFilePath, 'utf-8').split('\n').filter(Boolean);
  
    // Encontrar y eliminar este nodo de la lista
    const updatedNodes = nodes.filter(node => node !== this.addr.toString());
  
    // Escribir la lista actualizada de nodos al archivo
    fs.writeFileSync(this.nodesFilePath, updatedNodes.join('\n'));
  }
  
}
  

async function SyncContent(dest) {
  // console.log(dest + (await db_blocks.getTotalBlocks2()));
  const fileContent = 'sync°'+(await db_blocks.getTotalBlocks2()) + "°" + (await db_accounts.getTotalUsers());
  
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
  try {
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
      try {
        const lastSlashIndex = nodeAddr.lastIndexOf('/');
        const portNumber = nodeAddr.substring(lastSlashIndex + 1);
        if (port != portNumber) {
          const addr = multiaddr(nodeAddr);
          const socket = await transport.dial(addr, { upgrader });
          await pipe(
            [fileContent],
            socket
          );
          console.log(`File sent to ${addr.toString()}`);
        }
      } catch (error) {
        console.error(`Error sending file to node ${nodeAddr}:`, error.message);
        // Puedes continuar con el siguiente nodo o tomar otras medidas según tu lógica
        continue;
      }
    }
  } catch (error) {
    console.error('Error reading nodes file:', error.message);
    // Puedes manejar el error de lectura del archivo de nodos aquí
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

    

