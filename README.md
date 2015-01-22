implexus
========

**This is currently still under development**

![Logo](https://rawgit.com/RangerMauve/implexus-logo/master/logo.svg)

Takes in a graph describing streams, and builds up the pipeline

[![NPM](https://nodei.co/npm/implexus.png)](https://nodei.co/npm/implexus/)[![build status](https://secure.travis-ci.org/RangerMauve/implexus.png)](http://travis-ci.org/RangerMauve/implexus)

```
npm install --save implexus
```

The library expects graphs generated through [Graphlib](https://github.com/cpettitt/graphlib/wiki), or strings that define graphs in [DOT](http://www.graphviz.org/content/dot-language). Nodes are expected to define a `type` property which points to a defined stream type.

API
---

The library has a very small surface to make it super easy to integrate with.

### `new Implexus()`

Creates a new instance of Implexus. This is the top level export of the module.

### `Implexus#define(type, factory)`

Defines a new type of stream that can be used new graphs.

#### attributes

-	`type` `String` : The name for the stream type (corresponds to the `type` attribute in nodes)
-	`factory` `StreamFactory` : The `StreamFactory`function for creating a node of that type

#### returns

-	`Implexus` : Returns itself for chaining

### `Implexus#define(modules)`

A bulk version of `Implexus.define(type,factory)`

#### attributes

-	`modules` `Object<type,factory>` : A map that contains all the `type`s of streams, and points to `StreamFactory`s which create streams of that type.

#### returns

-	`Implexus` : Returns itself for chaining

### `Implexus#build(graph, cb)`

This parses out the graph, creates streams from the modules, and wires them up.

#### attributes

-	`graph` `Graph` : This is an instance of a [graphlib graph](https://github.com/cpettitt/graphlib/wiki/API-Reference#graph-api)
-	`cb` `Function(err, graph)` : Callback that gets called when everything is wired up. `graph` is a new instance of `ImplexusGraph`

#### returns

-	`Implexus` returns itself for easy chaining

### `StreamFactory(node, cb)`

This is the format for the stream factories. It's supposed to take in the data for a graph node, and create a new stream from it.

#### attributes

-	`node` `Object` : The node within the graph that describes the stream.
-	`cb` : This should get called with either an error object, or match one of the following
-	`Function(err,stream,[cleanup])` : Usually the factory should resolve in a stream, which will be used in the graph. Cleanup is a function used to destroy the created stream.
-	`Function(err, fn(chunk, [encoding]),[cleanup])` : Alternately, it can return a function that takes in data and an encoding, which gets passed to [through2-map](https://www.npmjs.com/package/through2-map) to make a stream
-	`Function(err, fn(chunk, encoding, callback),[cleanup])` : Same as above, but async, and gets passed into [through2](https://www.npmjs.com/package/through2) to make a stream.

### `ImplexusGraph#destroy(cb)`

This destroys the created graph of streams. It unpipes all the streams one by one, and calls the `cleanup` function if one was made by the stream's `StreamFactory`.

### attributes

-	`cb` `Function(err)` : This callback gets called when the graph has been destroyed, or if there was an error during its destruction.

### `ImplexusGraph#node(name)`

Fetches the stream from the graph by name.

#### attributes

-	`name` `String` : The name of the node to fetch
