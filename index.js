var events = require('events')
var parallel = require('run-parallel')
var DHT = require('./dht.js')
var MDNS = require('./mdns.js')

module.exports = function () {
  var dht = DHT()
  var mdns = MDNS()
  var pool = [{module: mdns, type: 'mdns'}, {module: dht, type: 'dht'}]

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
      peers.on('peer', function (addr, from) {
        allPeers.emit('peer', addr, p.type, from)
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
