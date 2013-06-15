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
  expressionist = require('expressionist'),
  debug = require('../debug')('sql'),
  util = require('../util'),
  sql = require('sql'),
  anyDB = require('any-db'),
  _ = require('underscore');

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
    case 'update':
      this.update(query, model, values, done);
      break;
    case 'select':
      this.select(query, model, values, done);
      break;
    case 'destroy':
      this.destroy(query, model, values, done);
      break;
    case 'count':
      this.count(query, model, values, done);
      break;
    default:
      throw new errors.NotImplementedError('This adapter does not support ' + query.type + ' queries');
  }

};

// @TODO: refactor following methods... lots of duplication. not good DRY
SQL.prototype.create = function (query, model, hash, cb) {
  // @todo: take hints from model.map.sql ? to know how to map attributes to columns.
  // also needed to map model id to columns
  // @TODO: saving an array should only generate one sql statement!
  // @TODO: make this work with arrays
  var table = sql.define({
    name: table_name(model.name),
    columns: model.attributes
  });

  var values = _.pick(hash, model.attributes);

  // save foreign ids on local attributes
  _.each(model.relationships, function (rel, name) {
    if (hash[name]) {
      var foreignModel = rel.model;
      foreignModel.id().forEach(function (attr) {
        // heuristick to guess the name of the foreign key
        // property_name_idattr
        values[name.toLowerCase() + '_' + attr] = hash[name][attr];
      });
    }
  });

  // @see https://github.com/brianc/node-sql/blob/master/test/dialects/insert-tests.js
  var q = table.insert(values).returning(model.id()).toQuery();
  debug(q);

  this.conn.query(q, function (err, res) {
    if (err) return cb(err);
    //var ret = { raw: res };

    res.rows.forEach(function (row) {
      util.extend(values, row);
    });

    return cb(err, values);
  });
};

SQL.prototype.update = function (query, model, values, cb) {
  var table = sql.define({
    name: table_name(model.name),
    columns: model.attributes
  });

  var q = table.update(values).where(query.expr.where).toQuery();
  debug(q);

  this.conn.query(q, function (err, res) {
    if (err) return cb(err);
    //var ret = { raw: res };
    res.rows.forEach(function (row) {
      util.extend(values, row);
    });

    return cb(null, values);
  });
};

function buildWhere (table, q, exp) {

  q = q.where(exp.evaluate({
    eql: function (operands) {
      var attribute = operands[0],
        value = operands[1];
      return table[attribute].equal(value);
    },
    notEql: function (operands) {
      var attribute = operands[0],
        value = operands[1];

      return table[attribute].notEqual(value);
    },
    or: function (operands) {
      var res = operands.shift();
      while (operands.length) {
        res = res.or(operands.shift());
      }
      return res;
    },
    and: function (operands) {
      var res = operands.shift();
      while (operands.length) {
        res = res.and(operands.shift());
      }
      return res;
    }
  }));

  return q;
}

SQL.prototype.select = function (query, model, values, cb) {
  var table = sql.define({
    name: table_name(model.name),
    columns: model.attributes
  });

  var q = table.select();

  if (query.expr.where) {
    // hack to check if where is an Expression
    if (query.expr.where.evaluate) {
      //q = buildFromExpression(query.expr.where);
      q = buildWhere(table, q, query.expr.where);
    }
    else {
      q = q.where(query.expr.where);
    }
  }
  if (query.expr.limit) {
    q = q.limit(query.expr.limit);
  }

  if (query.expr.order) {
    var orders = query.expr.order;
    orders.forEach(function (order) {
      var direction = order.direction || 'asc';
      q = q.order(table[order.attribute][direction]);
    });
  }

  q = q.toQuery();

  debug(q);

  this.conn.query(q, function (err, res) {
    if (err) return cb(err);
    cb(null, res.rows);
  });
};

SQL.prototype.destroy = function (query, model, values, cb) {
  var table = sql.define({
    name: table_name(model.name),
    columns: model.attributes
  });

  var q = table.delete(values).toQuery();

  this.conn.query(q, function (err, res) {
    if (err) return cb(err);

    cb(null, res);
  });
};

SQL.prototype.count = function (query, model, values, cb) {
  var table = sql.define({
    name: table_name(model.name),
    columns: model.attributes
  });

  var q = table.select(table.count().as('count')).toQuery();
  debug(q);

  this.conn.query(q.text, function (err, res) {
    if (err) return cb(err);
    cb(err, res.rows[0].count);
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
