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

Memory.prototype.flush = function (cb) {
  this.store = {};
  cb();
};

Memory.prototype.execute = function (query, model, values, cb) {
  var res;

  debug('execute: ' + query.type);

  switch (query.type) {
    case 'create':
      res = this.insert(model, values);
      break;
    case 'select':
      res = this.select(model, query);
      break;
    case 'destroy':
      res = this.destroy(model, values);
      break;
    default:
      throw new errors.NotImplementedError('This adapter does not support ' + query.type + ' queries');
      break;
  }

  debug('res: ', res);

  cb(null, res);
};


function compare_id (obj, id) {
  //todo
}

// @TODO: use binary tree + binary search to store objects?
// @TODO: use index for rapid lookups? maybe hash id and use it as key?
Memory.prototype.nextId = function (model) {
  var max_id = 0,
    collection = this.getCollection(model.name);

  for (var i = 0; i < collection.length; i++) {
    var obj = collection[i];
    if (obj[model.id()[0]] > max_id) {
      max_id = obj[model.id()[0]];
    }
  }

  return max_id + 1;
};

Memory.prototype.getCollection = function (collection_name) {
  this.store[collection_name] = this.store[collection_name] || [];
  return this.store[collection_name];
};

Memory.prototype.select = function (model, query) {
  var search, collection, expr = query.expr, matches = [], results;
  if (expr.id) {
    search = {};
    model.id().forEach(function (attr) {
      search[attr] = expr.id;
    });
    matches = this.findPartialMatch(model.name, search).results;
  }
  else {
    matches = this.getCollection(model.name);
  }

  if (expr.limit) {
    matches = matches.slice(0, expr.limit);
  }
  
  return matches;
};

// returns obj that match partially obj
Memory.prototype.findPartialMatch = function (collection_name, obj) {
  var collection = this.getCollection(collection_name),
    results = [],
    indexes = [],
    is_a_match;

  if (Object.keys(obj).length === 0) {
    throw new Error('Search object must have at least one key.');
  }

  debug('Searching ' + collection_name + ' for ', obj);

  for (var i = 0; i < collection.length; i++) {
    is_a_match = true;
    for (var k in obj) {
       if (obj[k] != collection[i][k]) 
         is_a_match = false;
    }
    if (is_a_match) {
      results.push(collection[i]);
      indexes.push(i);
    }
  }

  return { results: results, indexes: indexes };
};

Memory.prototype.insert = function (model, values) {
  var next_id,
    id_attrs = model.id();

  var collection = this.getCollection(model.name);

  next_id = this.nextId(model);

  id_attrs.forEach(function (attr) {
    values[attr] = next_id;
  });

  collection.push(values);

  return values;
};

Memory.prototype.destroy = function (model, values) {
  var id_attrs = model.id(), search, matches;

  search = model.extractId(values);

  matches = this.findPartialMatch(model.name, search);

  // get index of first match
  var index = matches.indexes[0];
  // delete it from collection
  console.log(this.getCollection(model.name));
  this.getCollection(model.name).splice(index, 1);

  console.log(this.getCollection(model.name));

  return values;
};

module.exports = function (opts) {
  opts = opts || {};
  return new Memory(opts);
}
