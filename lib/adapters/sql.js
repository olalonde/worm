/**
 * @TODO EXTRACT PGSQL SPECIFIC STUFF TO sql/pg
 * @TODO create sql/my, sql/ms, sql/web etc.
 * @TODO plugin system: dont distribute adapters with main module?
 * might be a good idea for client side at least
 * @TODO write PDO like module for Node.js
 * @TODO get rid off external dependencies? this should work for WebSQL for example.
 * @TODO: use transactions where it makes sense
 */

var errors = require('../errors'),
  debug = require('../debug')('sql'),
  util = require('../util'),
  sql = require('sql'),
  anyDB = require('any-db');

function pluralize (str) {
  str = str + 's'; //@TODO lol
  return str;
}

function table_name (model_name) {
  str = pluralize(model_name);
  str = str.toLowerCase();
  return str;
}

// could be used as a cache store instead
// of implementing the logic directly in worm
// models who want to use the cache could jsut add memory 
// as their first adapter??
var SQL = function (opts) {
  //this.namespace = '' || opts.namespace;
  if (typeof opts !== 'string') {
    throw new Error('Adapter ' + this.name + ' requires a connection string.');
  }
  this.conn = this.raw = anyDB.createConnection(opts);
  this.store = {};
};

SQL.prototype.name = 'sql';

// @TODO: this could probably be moved to BaseAdapter
SQL.prototype.execute = function (query, model, values, cb) {
  var res;

  function done (err, res) {
    cb(err, res);
  }

  debug('execute: ' + query.type);

  switch (query.type) {
    case 'create':
      this.create(query, model, values, done);
      break;
    case 'destroy':
      this.destroy(query, model, values, done);
      break;
    default:
      throw new errors.NotImplementedError('This adapter does not support ' + query.type + ' queries');
  }

};

SQL.prototype.create = function (query, model, values, cb) {
  // @todo: take hints from model.map.sql ? to know how to map attributes to columns.
  // also needed to map model id to columns
  // @TODO: saving an array should only generate one sql statement!
  // @TODO: make this work with arrays
  var table = sql.define({
    name: table_name(model.name),
    columns: model.attributes
  });

  // @see https://github.com/brianc/node-sql/blob/master/test/dialects/insert-tests.js
  var q = table.insert(values).returning(model.id()).toQuery();

  this.conn.query(q, function (err, res) {
    if (err) return cb(err);
    //var ret = { raw: res };

    res.rows.forEach(function (row) {
      util.extend(values, row);
    });

    return cb(err, values);
  });
};

SQL.prototype.destroy = function (query, model, values, cb) {
  var table = sql.define({
    name: table_name(model.name),
    columns: model.attributes
  });

  var q = table.delete(values).toQuery();

  this.conn.query(q, function (err, res) {
    cb(err, res);
  });
};

SQL.prototype.flush = function (cb) {
  // todo: this should clear data in all tables
  cb();
};

module.exports = function (opts) {
  opts = opts || {};
  return new SQL(opts);
};
