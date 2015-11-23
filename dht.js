var events = require('events')
var DHT = require('bittorrent-dht')
var cached = require('thunky')

module.exports = function () {
  var dht = new DHT()

  var dc = new events.EventEmitter()
  dc.dht = dht
  var lookups = {}

  dc.lookup = function (hash) {
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
    lookups[infoHash].emit('peer', addr, from)
  })

  var openDht = cached(function (cb) {
    dht.listen(function (err) {
      if (err) return cb(err)
      dht.on('ready', cb)
    })
  })

  dht.on('error', function (err) {
    throw err
  })

  return dc
}
