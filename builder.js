var map = require("map-async");
var par = require("par");
var isFunction = require("is-function");
var isObject = require("isobject");
var through = require("through2");
var throughMap = require("through2-map");

var ImplexusGraph = require("./graph.js");

exports.build = build;

function build(modules, graph, cb) {
	build_streams(modules, graph, function (err, stream_map) {
		if (err) return cb(err);
		try {
			link_streams(graph, stream_map);
		} catch (e) {
			cb(e);
			return;
		}
		cb(null, new ImplexusGraph(stream_map));
	});
}

function link_streams(graph, stream_map) {
	Object.keys(stream_map)
		.forEach(par(link_successors, graph, stream_map));

	return stream_map;
}

function build_streams(modules, graph, cb) {
	var node_map = build_node_map(graph);
	map(node_map, function (node, name, cb) {
		build_stream(modules, node, name, cb);
	}, cb);
}

function build_stream(modules, node, name, cb) {
	var type = node.type;
	var builder = modules[type];
	if (!builder)
		return cb(new Error("Stream type " + type + " does not exist for" + name), null);
	try {
		run_builder(builder, node, cb);
	} catch (e) {
		cb(e);
	}
}

function build_node_map(graph) {
	var nodes = graph.nodes();
	return nodes.reduce(function (build, name) {
		build[name] = graph.node(name);
		return build;
	}, {});
}

function link_successors(graph, stream_map, from) {
	var outbound = graph.successors(from);
	var from_stream = get_stream(stream_map, from);
	outbound
		.map(par(get_stream, stream_map))
		.forEach(par(pipe_together, from_stream));
}

function run_builder(builder, node, cb) {
	builder(node, function (err, result, cleanup) {
		if (err) return cb(err, null);
		process_builder_result(result, cleanup, cb);
	});
}

function process_builder_result(result, cleanup, cb) {
	if (isFunction(result)) {
		// Only registers (chunk,encoding)
		if (result.length <= 2) {
			finish(throughMap(result));
		} else {
			finish(through2(result));
		}
	} else if (isObject(result)) {
		// TODO: Actually check to see if it's a stream
		finish(result) // Probably a stream
	} else {
		cb(new Error("Factory returned an invalid type"));
	}

	function finish(stream) {
		cb(null, {
			stream: stream,
			cleanup: cleanup
		})
	}
}

function pipe_together(from, to) {
	from.pipe(to);
}

function get_stream(stream_map, name) {
	return stream_map[name].stream;
}