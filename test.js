var DC = require('./index.js')
var channel = DC()

var hash = 'AB552E29685745923F416D39EF4E3DAD18E8CFE6'

channel.on('peer', function (p) {
  console.log('peer', p)
})

channel.lookup(hash)