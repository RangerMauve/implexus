var Implexus = require("../").Implexus;
var fs = require("fs");
var util = require("util");

var graph = fs.readFileSync(__dirname + "/graph.dot", "utf8");

var implexus = new Implexus();

implexus.define("array",function(node, cb) {
	var but = require("but");
	var streamArray = require("stream-array");
	var source = (node.list || "")
	.split(",")
	.map(but(parseInt));
	var stream = streamArray(source);
	cb(null, stream);
});

implexus.define({
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
});

implexus.build(graph, function(err, streams) {
	var opts = {
		depth: 0
	};
	if (err) console.log(err, err.stack);
	else console.log("Stream map:", util.inspect(streams, opts));
});
