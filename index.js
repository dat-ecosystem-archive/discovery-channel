var events = require('events')
var DHT = require('bittorrent-dht')
var cached = require('thunky')

module.exports = function () {
  var dht = new DHT()
  
  var dc = new events.EventEmitter()
  
  dc.lookup = function (hash) {
    openDht(function (err) {
      if (err) throw err
      console.error('lookup')
      dht.lookup(hash)
    })
  }
  
  dht.on('peer', function (addr, infoHash, from) {
    dc.emit('peer', addr, infoHash, from)
  })
  
  var openDht = cached(function (cb) {
    console.error('listen')
    dht.listen(function (err) {
      if (err) return cb(err)
      dht.on('ready', cb)
    })
  })
  
  dht.on('error', function (err) {
    console.error('error', err)
  })
    
  return dc
}
