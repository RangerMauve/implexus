var assert = require("assert");
var Graph = require("graphlib").Graph;
var dot = require("graphlib-dot");
var fs = require("fs");
var util = require("util");
var Stream = require('stream');
var Writable = require('stream').Writable;
var through2 = require('through2').obj;

var implexus = require("../");

var collected;

var modules = {
	collect: function(node, cb) {
		var collector = new Writable({
			objectMode: true
		});
		collector._write = function(chunk, enc, cb) {
			if (!chunk) {
				this.end();
				return cb();
			}
			collected.push(chunk);
			cb();
		};

		cb(null, collector);
	},

	decrement: function(node, cb) {
		cb(null, through2(function(number, enc, cb) {
			if (number === 0) {
				this.end();
				return cb();
			}

			cb(null, --number);
		}));
	},
};

describe('implexus-core', function() {
	beforeEach(function(done) {
		collected = [];
		done();
	});

  it('errors when invalid stream type referenced', function(done) {
    var graph = new Graph();
    graph.setNode('a', {stream: 'mising'});
    implexus.build({}, graph, function(err) {
      assert(err, 'expected error');
      done();
		});
  });

	it('supports stream construction of graph with a single node', function(done) {
		var graph = loadGraph('single-node');

		implexus.build(modules, graph, function(err, streamMap) {
			assert(!err, err);

			var start = streamMap.start;
			assert(start instanceof Stream);

			start.on('finish', function() {
				assert.deepEqual(collected, ['hello']);
				done();
			});

			start.write('hello');
			start.end();
		});
	});

	it('supports the construction of graphs with cycles', function(done) {
		var graph = loadGraph('cycle');

		implexus.build(modules, graph, function(err, streamMap) {
			assert(!err, err);

			var start = streamMap.dec;

			streamMap.collect.on('finish', function() {
				assert.deepEqual(collected, [4, 3, 2, 1]);
				done();
			});

			start.write(5);
		});
	});
});

function loadGraph(name) {
	var graph_src = fs.readFileSync(__dirname + "/" + name + ".dot", "utf8");
	return dot.read(graph_src);
}
