implexus
========

**This is currently still under development**

![Logo](https://rawgit.com/RangerMauve/implexus-logo/master/logo.svg)

Takes in a graph describing streams, and builds up the pipeline

[![NPM](https://nodei.co/npm/implexus.png)](https://nodei.co/npm/implexus/)[![build status](https://secure.travis-ci.org/RangerMauve/implexus.png)](http://travis-ci.org/RangerMauve/implexus)

```
npm install --save implexus
```

The library expects graphs generated through [Graphlib](https://github.com/cpettitt/graphlib/wiki).

API
---

**This is all broken forever AHHHH!!!**

The library has a very small surface to make it super easy to integrate with.

### `build(graph, cb)`

This parses out the graph, creates streams from the modules, and wires them up.

#### attributes

-	`modules` `Object<type,streamFactory()` : This is a map that contains all the `type`s of streams, and points to `streamFactory`s which create streams of that type.
-	`graph` `Graph` : This is an instance of a [graphlib graph](https://github.com/cpettitt/graphlib/wiki/API-Reference#graph-api)
-	`cb` `Function(err, stream_map)` : Callback that gets called when everything is wired up.

### `streamFactory(name, node, cb)`

This is what the format for the stream factories. It's supposed to take in the data for a graph node, and create a new stream from it.

#### attributes

-	`name` `String` : The name of the node in the graph
-	`node` `Object` : The node with properties for describing it
-	`cb` : This should get called with either an error object, or match one of the following
	-	`Function(err,stream)` : Usually the factory should resolve in a stream, which will be used in the graph
	-	`Function(err, fn(chunk, [encoding]))` : Alternately, it can return a function that takes in data and an encoding, which gets passed to [through2-map](https://www.npmjs.com/package/through2-map) to make a stream
	-	`Function(err, fn(chunk, encoding, callback))` : Same as above, but async, and gets passed into [through2](https://www.npmjs.com/package/through2) to make a stream.
