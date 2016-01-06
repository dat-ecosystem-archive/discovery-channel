var dns = require('dns-discovery')
var DHT = require('bittorrent-dht')
var crypto = require('crypto')
var events = require('events')
var util = require('util')

module.exports = Discovery

function Discovery (opts) {
  if (!(this instanceof Discovery)) return new Discovery(opts)
  if (!opts) opts = {}

  var self = this

  this.dht = opts.dht === false ? null : new DHT(opts.dht)
  this.dns = opts.dns === false ? null : dns(opts.dns)
  if (this.dns) this.dns.on('peer', ondnspeer)
  if (this.dht) this.dht.on('peer', ondhtpeer)
  this.destroyed = false

  this._dhtInterval = opts.dht && opts.dht.interval
  this._dnsInterval = opts.dns && opts.dns.interval
  this._announcing = {}
  this._unsha = {}

  events.EventEmitter.call(this)

  function ondhtpeer (peer, infoHash) {
    if (self.destroyed) return
    var id = self._unsha[infoHash.toString('hex')]
    if (id) self.emit('peer', id, peer, 'dht')
  }

  function ondnspeer (name, peer) {
    if (self.destroyed) return
    self.emit('peer', new Buffer(name, 'hex'), peer, 'dns')
  }
}

util.inherits(Discovery, events.EventEmitter)

Discovery.prototype.add = function (id, port) {
  if (this.destroyed) return
  if (!port) port = 0
  if (typeof id === 'string') id = new Buffer(id)

  var self = this
  var name = id.toString('hex')
  var sha1 = crypto.createHash('sha1').update(id).digest()
  var dnsTimeout = null
  var dhtTimeout = null

  this._unsha[sha1.toString('hex')] = id
  this._announcing[id.toString('hex') + ':' + port] = clear

  if (this.dns) dns()
  if (this.dht) dht()

  function clear () {
    clearTimeout(dnsTimeout)
    clearTimeout(dhtTimeout)
    delete self._unsha[sha1.toString('hex')]
    if (self.dns) self.dns.unannounce(name, port)
  }

  function dns () {
    if (port) self.dns.announce(name, port)
    self.dns.lookup(name)
     // TODO: this might be to aggressive for trackers?
    dnsTimeout = setTimeout(dns, this._dnsInterval || (60 * 1000 + (Math.random() * 10 * 1000) | 0))
  }

  function dht () {
    if (port) self.dht.announce(sha1, port)
    else self.dht.lookup(sha1)
    dhtTimeout = setTimeout(dht, this._dhtInterval || (10 * 60 * 1000 + (Math.random() * 5 * 60 * 1000) | 0))
  }
}

Discovery.prototype.remove = function (id, port) {
  if (this.destroyed) return
  if (!port) port = 0
  if (typeof id === 'string') id = new Buffer(id)
  var key = id.toString('hex') + ':' + port
  if (!this._announcing[key]) return
  this._announcing[key]()
  delete this._announcing[key]
}

Discovery.prototype.destroy = function (cb) {
  if (this.destroyed) {
    if (cb) process.nextTick(cb)
    return
  }
  this.destroyed = true
  var keys = Object.keys(this._announcing)
  for (var i = 0; i < keys.length; i++) this._announcing[keys[i]]()
  this._announcing = {}
  if (cb) this.once('close', cb)
  var self = this

  if (!this.dht) ondhtdestroy()
  else this.dht.destroy(ondhtdestroy)

  function ondhtdestroy () {
    if (!self.dns) ondnsdestroy()
    else self.dns.destroy(ondnsdestroy)
  }

  function ondnsdestroy () {
    self.emit('close')
  }
}
