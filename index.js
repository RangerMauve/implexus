var isFunction = require("is-function");
var isObject = require("isobject");
var mapObject = require("map-object");
var builder = require("./builder.js");

exports.Implexus = Implexus;

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
	mapObject.lv(object, self.use, self);
}

function build(graph, cb) {
	implexusCore.buil(this.modules, graph, cb);
}
