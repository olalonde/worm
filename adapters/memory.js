var errors = require('../errors'),
  debug = require('../debug')('memory');

// could be used as a cache store instead
// of implementing the logic directly in worm
// models who want to use the cache could jsut add memory 
// as their first adapter??
var Memory = function (opts) {
  //this.namespace = '' || opts.namespace;
  this.store = {};
}

Memory.prototype.name = 'memory';

Memory.prototype.execute = function (query, model, values, cb) {
  var res;

  debug('execute: ' + query.type);

  if (query.type === 'create') {
    res = this.insert(model, values);
  }

  cb(null, res);
};


function compare_id (obj, id) {
  //todo
}

// @TODO: use binary tree + binary search to store objects?
// @TODO: use index for rapid lookups? maybe hash id and use it as key?
Memory.prototype.nextId = function (model) {
  var max_id = 1,
    collection = this.store[model.name];

  for (var i = 0; i < collection.length; i++) {
    var obj = collection[i];
    if (obj[model.id()[0]] > max_id) {
      max_id = obj[model.id()[0]];
    }
  }

  return max_id + 1;
};

Memory.prototype.insert = function (model, values) {
  var next_id,
    id_attrs = model.id();

  this.store[model.name] = this.store[model.name] || [];

  next_id = this.nextId(model);

  id_attrs.forEach(function (attr) {
    values.attr = next_id;
  });

  this.store[model.name].push(values);

  return values;
};

module.exports = function (opts) {
  opts = opts || {};
  return new Memory(opts);
}
