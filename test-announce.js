var DC = require('./index.js')
var channel = DC()

var hash = new Buffer('deadbeefbeefbeefbeefdeadbeefbeefbeefbeef', 'hex')

channel.announce(hash, 1337, function (err) {
  if (err) throw err
  console.log('announced')
})
