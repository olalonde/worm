/**
 * @TODO EXTRACT PGSQL SPECIFIC STUFF TO sql/pg
 * @TODO create sql/my, sql/ms, sql/web etc.
 * @TODO plugin system: dont distribute adapters with main module?
 * might be a good idea for client side at least
 * @TODO write PDO like module for Node.js
 */

var errors = require('../errors'),
  debug = require('../debug')('sql'),
  anyDB = require('any-db');

// could be used as a cache store instead
// of implementing the logic directly in worm
// models who want to use the cache could jsut add memory 
// as their first adapter??
var SQL = function (opts) {
  //this.namespace = '' || opts.namespace;
  if (!(typeof opts === 'string')) {
    throw new Error('Adapter ' + this.name + ' requires a connection string.');
  }
  this.conn = anyDB.createConnection(opts);
  this.store = {};
}

SQL.prototype.name = 'memory';

// @TODO: this could probably be moved to BaseAdapter
SQL.prototype.execute = function (query, model, values, cb) {
  var res;

  debug('execute: ' + query.type);

  switch (query.type) {
    case 'create':
    case 'select':
    case 'destroy':
    default:
      throw new errors.NotImplementedError('This adapter does not support ' + query.type + ' queries');
      break;
  }

  debug('res: ', res);

  cb(null, res);
};

module.exports = function (opts) {
  opts = opts || {};
  return new SQL(opts);
}
