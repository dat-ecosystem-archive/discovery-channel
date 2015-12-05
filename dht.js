var events = require('events')
var DHT = require('bittorrent-dht')
var cached = require('thunky')

// SLOW to start up because bittorrent-dht is slow to cold startup

module.exports = function () {
  var dht = new DHT()

  var dc = new events.EventEmitter()
  dc.dht = dht
  var lookups = {}

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
    openDht(function (err) {
      if (err) throw err
      dht.lookup(hash)
    })
    return peers
  }

  dc.announce = function (hash, port, cb) {
    openDht(function (err) {
      if (err) throw err
      dht.announce(hash, port, cb)
    })
  }

  dc.close = function (cb) {
    dht.destroy(cb)
  }

  dht.on('peer', function (addr, infoHash, from) {
    var lookup = lookups[infoHash]
    if (!lookup) return
    var parts = addr.split(':')
    lookup.emit('peer', parts[0], parts[1], from)
  })

  var openDht = cached(function (cb) {
    if (dht.listening) return cb()
    dht.on('ready', cb)
  })

  dht.on('error', function (err) {
    throw err
  })

  return dc
}
