var map = require("map-async");

module.exports = ImplexusGraph;

function ImplexusGraph(streams) {
	this.streams = streams;
}

ImplexusGraph.prototype = {
	constructor: ImplexusGraph,
	streams: null,
	destroy: destroy,
	node: node
}

function node(name){
	return this.streams[name];
}

function destroy(cb) {
	map(this.streams, destroyStream, cb);
}

function destroyStream(object, name, cb) {
	var stream = object.stream;
	var cleanup = object.cleanup;

	if (stream.unpipe) stream.unpipe();
	if (cleanup) cleanup(stream, cb);
	else cb();
}
