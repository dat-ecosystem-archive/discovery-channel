var test = require('tape')
var DC = require('./index.js')

var id = new Date().toISOString()

test('find each other', function (t) {
  var pending = 2
  t.plan(2)

  var channel1 = DC()
  var channel2 = DC()

  channel1.add(id, 1337)
  channel2.add(id, 7331)

  channel1.on('peer', function (hash, peer) {
    if (peer.port === 7331) {
      t.pass('found second channel')
      done()
    }
  })

  channel2.on('peer', function (hash, peer) {
    if (peer.port === 1337) {
      t.pass('found first channel')
      done()
    }
  })

  function done () {
    if (--pending) return
    channel1.destroy()
    channel2.destroy()
  }
})
