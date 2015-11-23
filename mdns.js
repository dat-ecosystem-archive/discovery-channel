var events = require('events')
var multicastdns = require('multicast-dns')
var addr = require('network-address')

module.exports = function (opts) {
  if (!opts) opts = {}

  var mdns = multicastdns()
  var host = addr()
  var lookups = {}
  var hashes = {}

  var dc = new events.EventEmitter()

  dc.lookup = function (hash) {
    if (!Buffer.isBuffer(hash)) hash = new Buffer(hash, 'hex')
    var hashString = hash.toString('hex')
    var peers = lookups[hashString]
    if (!peers) {
      peers = new events.EventEmitter()
      peers.destroy = function (cb) { process.nextTick(cb) }
    }
    if (Object.keys(lookups).indexOf(hashString) === -1) {
      lookups[hashString] = peers
    }
    mdns.query([{name: hashString, type: 'SRV'}])
    return peers
  }

  dc.announce = announce

  dc.close = function (cb) {
    mdns.destroy(cb)
  }

  mdns.on('query', function (q) {
    for (var i = 0; i < q.questions.length; i++) {
      var qs = q.questions[i]
      if (Object.keys(hashes).indexOf(qs.name) > -1 && qs.type === 'SRV') return announce(qs.name, hashes[qs.name])
    }
  })

  mdns.on('response', function (r) {
    for (var i = 0; i < r.answers.length; i++) {
      var a = r.answers[i]
      if (Object.keys(lookups).indexOf(a.name) > -1 && a.type === 'SRV') {
        lookups[a.name].emit('peer', a.data.target, a.data.port, null)
      }
    }
  })

  function announce (hash, port, cb) {
    if (!Buffer.isBuffer(hash)) hash = new Buffer(hash, 'hex')
    var hashString = hash.toString('hex')
    hashes[hashString] = port
    mdns.response([{
      name: hashString,
      type: 'SRV',
      data: {
        port: port,
        weigth: 0,
        priority: 10,
        target: host
      }
    }])
    if (cb) process.nextTick(cb)
  }

  return dc
}
