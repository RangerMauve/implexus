var map = require("map-async");
var par = require("par");

exports.build = build;

function build(modules, graph, cb) {
	build_streams(modules, graph, function(err, stream_map) {
		if (err) return cb(err);
		try {
			link_streams(graph, stream_map);
		} catch (e) {
			cb(e);
			return;
		}
		cb(null, stream_map);
	});
}

function link_streams(graph, stream_map) {
	Object.keys(stream_map)
		.forEach(par(link_successors, graph, stream_map));

	return stream_map;
}

function build_streams(modules, graph, cb) {
	var node_map = build_node_map(graph);
	map(node_map, function(node, name, cb) {
		build_stream(modules, node, name, cb);
	}, cb);
}

function build_stream(modules, node, name, cb) {
	var type = node.stream;
	var builder = modules[type];
	if (!builder)
		return cb(new Error("Stream type " + type + " does not exist for" + name), null);
	try {
		builder(node, cb);
	} catch (e) {
		cb(e);
	}
}

function build_node_map(graph) {
	var nodes = graph.nodes();
	return nodes.reduce(function(build, name) {
		build[name] = graph.node(name);
		return build;
	}, {});
}

function link_successors(graph, stream_map, from) {
	var outbound = graph.successors(from);
	var from_stream = stream_map[from];
	outbound
		.map(par(get_stream, stream_map))
		.forEach(par(pipe_together, from_stream));
}

function pipe_together(from, to) {
	from.pipe(to);
}

function get_stream(stream_map, name) {
	return stream_map[name];
}
