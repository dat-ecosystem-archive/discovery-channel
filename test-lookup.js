var DC = require('./index.js')
var channel = DC()

var hash = new Buffer('deadbeefbeefbeefbeefdeadbeefbeefbeefbeef', 'hex')

channel.add(hash)
channel.on('peer', function (hash, peer, type) {
  console.log('found peer: ' + peer.host + ':' + peer.port + ' using ' + type + (peer.local ? ' (local)' : ''))
})
