# discovery-channel

Search for a key across multiple discovery networks and find peers who answer.

Currently searches across and advertises on [the Bittorrent DHT](https://en.wikipedia.org/wiki/Mainline_DHT) and [Multicast DNS](https://en.wikipedia.org/wiki/Multicast_DNS) simultaneously.

[![travis][travis-image]][travis-url]

[travis-image]: https://img.shields.io/travis/maxogden/discovery-channel.svg?style=flat
[travis-url]: https://travis-ci.org/maxogden/discovery-channel

## Usage

### `var DC = require('discovery-channel')`

Returns a constructor

### `var channel = DC(<opts>)`

Returns a new instance. `opts` is optional and can have the following properties:

- `pool` - default `[]`, an array of any custom channels you want to use (see source code for details)
- `mdns` - default `undefined`, if `false` will disable `mdns` discovery, any other value type will be passed to the `multicast-mdns` constructor
- `dht` - default `undefined`, if `false` will disable `dht` discovery, any other value type will be passed to the `bittorrent-dht` constructor

### `var lookup = channel.lookup(hash)`

Perform a lookup across all networks for `hash`. `lookup` is returned and is an event emitter

### `lookup.on('peer', ip, port, type, <from>)`

Emitted when a peer answers your query. 

- `ip` is the IP address the peer sent you in response to `hash`
- `port` is the port the peer sent you in response to `hash`
- `type` is the network type (one of `['dht', `mdns`]`)
- `from` is the IP address of the peer that sent you the response (will be `null` if the peers IP was not included in the response)

### `channel.announce(hash, port, <cb>)`

Advertise to peers across all networks that you can be queried for information about `hash` at `port`. If passed in, `cb` will be called when the announce has been completed and called with `(err)` if there was an error announcing.

### `channel.close(<cb>)`
  
Stops all lookups and advertisements and call `cb` when done, with `(err)` if there was an error.
