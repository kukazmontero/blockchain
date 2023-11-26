const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const { NOISE } = require('libp2p-noise')
const MPLEX = require('libp2p-mplex')

async function main () {
  const node = await Libp2p.create({
    modules: {
      transport: [TCP],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX]
    }
  })

  await node.start()
  console.log(`Node started with id ${node.peerId.toB58String()}`)

  const target = '/ip4/127.0.0.1/tcp/12345/p2p/QmaB4e5ix7mBSKNCt9X6Xr1LkEPkeE3MKBFv3yPxce3MxL'
  const { stream } = await node.dialProtocol(target, '/chat/1.0.0')
  console.log('Connected to peer:', target)


  process.stdin.on('data', (chunk) => {
    stream.write(chunk)
  })
}

main()
