import { tcp } from '@libp2p/tcp';
import { multiaddr } from '@multiformats/multiaddr';
import { pipe } from 'it-pipe';
import all from 'it-all';
import fs from 'fs';
import { Transaction } from "./classes/Transaction.js";
import { Block } from "./classes/Block.js";
import { DBBlocks, DBAccounts } from "./classes/DBManager.js";
import express from 'express';
import { showMenu, registerAccount, generateTransaction, getAccountByAddress } from './routes/API.js';

const port = process.argv[2];

if (!port) {
  console.log("Usage: node script.js <port>");
  process.exit(1);
}

const db_blocks = new DBBlocks(`./db/db_blocks_${port}.db`);
const db_accounts = new DBAccounts(`./db/db_accounts_${port}.db`);
const N = 5;
let transactions = [];
var accounts = [];
var chain = [];

const app = express();
app.use(express.json()); 

app.get('/menu', showMenu);

app.post('/account', async (req, res) => {await registerAccount(req, res, db_accounts, accounts, sendFileToAllNodes)});

app.post('/transaction', async (req, res) => { await generateTransaction(req, res, db_accounts, db_blocks, chain, sendFileToAllNodes, generateBlock, N) } );

// Modifica el endpoint para obtener una cuenta por dirección
app.get('/account/:address', async (req, res) => { await getAccountByAddress(req, res, db_accounts) });

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
          } 
          else if (values.toString().split("°")[0] === "sync") {
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
          } 
          else if (values.toString().split("-")[0] == '1') {
            const new_acount = values.toString().split("-")[1];
            console.log(JSON.parse(await registerUser2(db_accounts, new_acount)));
          } 
          else if (values.toString().split("-")[0] == '2') {
            const block = JSON.parse(values.toString().split("-")[1]);
            console.log(block);
            await db_blocks.saveBlock(block);
          } 
          else if (values.toString().split("-")[0] == '0') {
            const newcontent = JSON.parse(values.toString().split("-")[1]);
            console.log(JSON.parse(await registerUser2(db_accounts, JSON.stringify(newcontent))));
          } 
          else if (values.toString().split("-")[0] == 'bloqued') {
            const addr = values.toString().split("-")[1];
            await db_accounts.modifyState(addr, true);
          } 
          else if (values.toString().split("-")[0] == 'unbloqued') {
            const addr = values.toString().split("-")[1];
            await db_accounts.modifyState(addr, false);
          } 
          else if (values.toString().split("-")[0] == 'addmoney') {
            const addr = values.toString().split("-")[1];
            const money = parseInt(values.toString().split("-")[2]);
            await db_accounts.modifyMoney(addr, money);
          } 
          else if (values.toString().split("-")[0] == 'descmoney') {
            const addr = values.toString().split("-")[1];
            const money = parseInt(values.toString().split("-")[2]);
            await db_accounts.modifyMoney(addr, -money);
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
    const nodes = fs.readFileSync("nodes.txt", 'utf-8').split('\n').filter(Boolean);
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

  let nodeAddr = nodes[0]

  let portdest = nodeAddr.toString().split("/")[4];

  if(nodes[1] && fileContent.toString().split("_")[1] == portdest){
    
    nodeAddr = nodes[1]

    portdest = nodeAddr.toString().split("/")[4];

  }

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

const generateBlock = (index, previousHash, transactions) => {
    return new Block(index, Date.now(), transactions, previousHash);
};

const registerUser = async (db_accounts, name) => {
    return await db_accounts.registerAccount(name);
};
const registerUser2 = async (db_accounts, name) => {
  return await db_accounts.registerAccount2(name);
};

// CREACIÓN DEL NODO Y BLOQUE DE ORIGEN
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