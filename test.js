var DC = require('./index.js')
var channel = DC()

var hash = new Buffer('deadbeefbeefbeefbeefdeadbeefbeefbeefbeef', 'hex')

var peers = channel.lookup(hash)

peers.on('peer', function (ip, port) {
  console.log('peer', ip, port)
})
