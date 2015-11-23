var events = require('events')
var DHT = require('./dht.js')
var parallel = require('run-parallel')

module.exports = function () {
  var dht = DHT()
  var pool = [{module: dht, type: 'dht'}]

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
        allPeers.emit('peer', addr, from, p.type)
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
