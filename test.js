var crypto = require('crypto')
var test = require('tape')
var DC = require('./index.js')

var channel = DC()
var hash = crypto.createHash('sha1').update(new Date().toISOString()).digest()

test('announce all', function (t) {
  channel.announce(hash, 1337, function (err) {
    if (err) {
      t.ifErr(err)
      throw err
    }
    t.ok(true, 'no error')
    t.end()
  })
})

test('lookup all', function (t) {
  var peers = channel.lookup(hash)

  peers.once('peer', function (ip, port) {
    t.equal(port, 1337, 'port 1337')
    channel.close(function (err) {
      if (err) {
        t.ifErr(err)
        throw err
      }
      t.end()
    })
  })
})
