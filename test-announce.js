var DC = require('./index.js')
var channel = DC()

var hash = new Buffer('deadbeefbeefbeefbeefdeadbeefbeefbeefbeef', 'hex')

channel.join(hash, Number(process.argv[2] || 1337))
