implexus-core
=============

![Logo](https://rawgit.com/RangerMauve/implexus-logo/master/logo.svg)

Takes in a graph describing streams, and builds up the pipeline

[![NPM](https://nodei.co/npm/implexus-core.png)](https://nodei.co/npm/implexus-core/)[![build status](https://secure.travis-ci.org/RangerMauve/implexus-core.png)](http://travis-ci.org/RangerMauve/implexus-core)

```
npm install --save implexus-core
```

The library expects graphs generated through [Graphlib](https://github.com/cpettitt/graphlib/wiki).

Example
-------

Given a graph that looks like this:

![Graph visualization](https://rawgit.com/RangerMauve/implexus-core/master/example/graph.svg)

```dot
digraph {
  A[stream="array",list="1,2,3,4"];
  B[stream="adder",amount="100"];
  C[stream="stdout",prefix="Output:"];

  A -> B -> C;
  A -> C;
}
```

And some stream factories that look like:

```javascript
var modules = {
	array: function(node, cb) {
		var but = require("but");
		var streamArray = require("stream-array");
		var source = (node.list || "")
		.split(",")
		.map(but(parseInt));
		var stream = streamArray(source);
		cb(null, stream);
	},
	stdout: function(node, cb) {
		var stdout = require("stdout");
		var prefix = node.prefix || "";
		cb(null, stdout(prefix));
	},
	adder: function(node, cb) {
		var map = require("through2-map").obj;
		var amount = parseInt(node.amount) || 1;
		cb(null, map(function(number) {
			return number + amount;
		}));
	}
};
```

With a bit more code, we can wire it all up together!

```javascript
var implexus = require("../");
var dot = require("graphlib-dot");
var fs = require("fs");
var util = require("util")

var graph_src = fs.readFileSync(__dirname + "/graph.dot", "utf8");
var graph = dot.read(graph_src);

implexus.build(modules, graph, function(err, streams) {
	if (err) console.log(err, err.stack);
	else console.log("Stream map:", util.inspect(streams, {
		depth: 0
	}));
});
```

API
---

The library has a very small surface to make it super easy to integrate with.

### `build(modules, graph, cb)`

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
