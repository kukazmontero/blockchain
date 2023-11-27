import { tcp } from '@libp2p/tcp';
import { multiaddr } from '@multiformats/multiaddr';
import { pipe } from 'it-pipe';
import all from 'it-all';
import fs from 'fs';

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
      }
    });

    await listener.listen(this.addr);
    console.log('Listening on', this.addr.toString());

    // Registrar este nodo
    fs.appendFileSync('nodes.txt', `${this.addr.toString()}\n`);
  }
}

async function sendMessageToAll(message) {
  const nodes = fs.readFileSync('nodes.txt', 'utf-8').split('\n').filter(Boolean);
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

// Para enviar mensajes desde la línea de comandos
process.stdin.on('data', async (data) => {
  const message = data.toString().trim();
  await sendMessageToAll(message);
});
