var implexus = require("../");
var dot = require("graphlib-dot");
var fs = require("fs");
var util = require("util");

var modules = {
	array: function(name, node, cb) {
		var but = require("but");
		var streamArray = require("stream-array");
		var source = (node.list || "")
			.split(",")
			.map(but(parseInt));
		var stream = streamArray(source);
		cb(null, stream);
	},
	stdout: function(name, node, cb) {
		var stdout = require("stdout");
		var prefix = node.prefix || "";
		cb(null, stdout(prefix));
	},
	adder: function(name, node, cb) {
		var map = require("through2-map").obj;
		var amount = parseInt(node.amount) || 1;
		cb(null, map(function(number) {
			return number + amount;
		}));
	},
	interval: function(name, node, cb) {
		var interval = require("interval-stream");
		var time = parseInt(node.time) || 1000;
		cb(null, interval(time));
	}
};

var graph_src = fs.readFileSync(__dirname + "/graph.dot", "utf8");
var graph = dot.read(graph_src);

implexus.build(modules, graph, function(err, streams) {
	if (err) console.log(err, err.stack);
	else console.log("Stream map:", util.inspect(streams, {
		depth: 0
	}));
});
