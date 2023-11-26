const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const { NOISE } = require('libp2p-noise')
const MPLEX = require('libp2p-mplex')

async function main () {
  const node = await Libp2p.create({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/12345']
    },
    modules: {
      transport: [TCP],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX]
    }
  })

  await node.start()
  console.log(`Node started with id ${node.peerId.toB58String()}`)

  node.handle('/chat/1.0.0', ({ stream }) => {
    console.log('Received a message:')
    stream.on('data', (chunk) => {
      console.log(chunk.toString())
    })
  })
}

main()
