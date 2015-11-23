var DC = require('./index.js')
var channel = DC()

var hash = new Buffer('deadbeefbeefbeefbeefdeadbeefbeefbeefbeef', 'hex')

var peers = channel.lookup(hash)

peers.on('peer', function (p) {
  console.log('peer', p)

  setTimeout(function () {
    channel.close()
  }, 5000)
})
