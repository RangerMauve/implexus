var isFunction = require("is-function");
var isObject = require("isobject");
var isString = require("x-is-string");
var mapObject = require("map-object");
var dot = require("graphlib-dot");

var builder = require("./builder.js");

module.exports = Implexus;

function Implexus() {
	if (!(this instanceof Implexus))
		return new Implexus();
	this.modules = {};
}

Implexus.prototype = {
	constructor: Implexus,
	modules: null,
	define: define,
	build: build
}

function define(type, factory) {
	if (!type)
		throw new Error("Must specify type of stream");

	if (isObject(type)) {
		defineAll(this, type);
		return this;
	}

	if (!factory)
		throw new Error("No factory function provided");

	if (isFunction(factory)) {
		this.modules[type] = factory;
		return this;
	}

	throw new Error("Invalid factory type: " + factory);
}

function defineAll(self, object) {
	mapObject.kv(object, define, self);
}

function build(graph, cb) {
	if (isString(graph))
		graph = dot.read(graph);
	else if (!isObject(graph))
		return cb(new Error("Invalid graph type"));

	builder.build(this.modules, graph, cb);
	
	return this;
}
