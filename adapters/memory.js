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

  switch (query.type) {
    case 'create':
      res = this.insert(model, values);
      break;
    case 'select':
      res = this.select(model, query);
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
  var search, collection, expr = query.expr, matches = [];
  if (expr.id) {
    search = {};
    model.id().forEach(function (attr) {
      search[attr] = expr.id;
    });
    matches = this.findPartialMatch(model.name, search);
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
    matches;

  if (Object.keys(obj).length === 0) {
    throw new Error('Search object must have at least one key.');
  }

  debug('Searching ' + collection_name + ' for ', obj);

  for (var i = 0; i < collection.length; i++) {
    matches = true;
    for (var k in obj) {
       if (obj[k] != collection[i][k]) 
         matches = false;
    }
    if (matches) {
      results.push(collection[i]);
    }
  }

  return results;
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

module.exports = function (opts) {
  opts = opts || {};
  return new Memory(opts);
}
