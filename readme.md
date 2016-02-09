# discovery-channel

Search for a key across multiple discovery networks and find peers who answer.

Currently searches across and advertises on [the Bittorrent DHT](https://en.wikipedia.org/wiki/Mainline_DHT), centralized DNS servers and [Multicast DNS](https://en.wikipedia.org/wiki/Multicast_DNS) simultaneously.

Uses the [bittorrent-dht](https://github.com/feross/bittorrent-dht) and [dns-discovery](https://github.com/mafintosh/dns-discovery) modules.

Also check out [discovery-swarm](https://github.com/mafintosh/discovery-swarm) which adds connection management on top of this module.

[![travis][travis-image]][travis-url]

[travis-image]: https://img.shields.io/travis/maxogden/discovery-channel.svg?style=flat
[travis-url]: https://travis-ci.org/maxogden/discovery-channel

## Usage

### `var DC = require('discovery-channel')`

Returns a constructor

### `var channel = DC(<opts>)`

Returns a new instance. `opts` is optional and can have the following properties:

- `dns` - default `undefined`, if `false` will disable `dns` discovery, any other value type will be passed to the `dns-discovery` constructor
- `dht` - default `undefined`, if `false` will disable `dht` discovery, any other value type will be passed to the `bittorrent-dht` constructor

By default hashes are re-announced around every 10 min on the dht and 1 min using dns. Set `dht.interval` or `dns.interval` to change these.

### `channel.add(hash, [port])`

Perform a lookup across all networks for `hash`.
Specify `port` if you want to announce that you share `hash` as well.

### `channel.remove(hash, [port])`

Stop looking for `hash`.
Specify `port` to stop announcing that you share `hash` as well.

### `var bool = channel.has(hash, [port])`

Returns `true` if you've added `hash` and `port` earlier otherwise `false`.

### `channel.on('peer', hash, peer, type)`

Emitted when a peer answers your query.

- `hash` is the hash this peer was discovered for
- `peer` is the peer that was discovered `{port: port, host: host}`
- `type` is the network type (one of `['dht', 'dns']`)

### `channel.destroy(cb)`

Stops all lookups and advertisements and call `cb` when done.

### `channel.on('close')`

Emitted when the channel is destroyed
