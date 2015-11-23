var events = require('events')
var parallel = require('run-parallel')
var DHT = require('./dht.js')
var MDNS = require('./mdns.js')

module.exports = function (opts) {
  if (!opts) opts = {}
  var pool = opts.pool || []

  if (opts.dht !== false) {
    var dht = DHT(opts.dht)
    pool.push({module: dht, type: 'dht'})
  }

  if (opts.mdns !== false) {
    var mdns = MDNS(opts.mdns)
    pool.push({module: mdns, type: 'mdns'})
  }

  if (pool.length === 0) throw new Error('must specify at least one discovery channel')

  function announce (hash, port, cb) {
    var tasks = pool.map(function (p) {
      return function (cb) {
        p.module.announce(hash, port, cb)
      }
    })
    parallel(tasks, cb)
  }

  function lookup (hash) {
    var allPeers = new events.EventEmitter()
    pool.forEach(function (p) {
      var peers = p.module.lookup(hash)
      peers.on('peer', function (ip, port, from) {
        allPeers.emit('peer', ip, port, p.type, from)
      })
    })
    return allPeers
  }

  function close (cb) {
    var tasks = pool.map(function (p) {
      return function (cb) {
        p.module.close(cb)
      }
    })
    parallel(tasks, cb)
  }

  var dc = {
    announce: announce,
    lookup: lookup,
    close: close
  }

  return dc
}
