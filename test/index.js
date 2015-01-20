var assert = require("assert");
var fs = require("fs");
var util = require("util");
var Stream = require('stream');
var Writable = require('stream').Writable;
var through = require('through2').obj;
var Graph = require("graphlib").Graph;

var implexus = require("../");

var collected;

var modules = {
	collect: function(node, cb) {
		cb(null, through(function(chunk, enc, cb) {
			if (!chunk) {
				this.end();
				return cb();
			}
			collected.push(chunk);
			cb();
		}));
	},

	decrement: function(node, cb) {
		cb(null, through(function(number, enc, cb) {
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
		graph.setNode('a', {stream: 'missing'});
		implexus.build({}, graph, function(err) {
			assert(err, 'expected error');
			done();
		});
  });

	it('supports stream construction of graph with a single node', function(done) {
		var graph = new Graph();
		graph.setNode('start', {stream: 'collect'});

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
		var graph = new Graph();
		graph.setNode('dec', {stream: 'decrement'});
		graph.setNode('collect', {stream: 'collect'});
		graph.setEdge('dec', 'collect');
		graph.setEdge('dec', 'dec');

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
