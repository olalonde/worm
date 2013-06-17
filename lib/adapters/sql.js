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
  debug = require('debug')('worm:adapter:sql'),
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
    case 'load':
      this.load(query, model, values, done);
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

  // save hasOne relationship ids to local attributes
  // we can safely assume the relationships were already saved by worm
  _.each(model.hasOneRelationships(), function (rel, name) {
    if (hash[name]) {
      var foreignModel = rel.model;
      foreignModel.id().forEach(function (attr) {
        // heuristic to guess the name of the foreign key
        // property_name_idattr
        values[name.toLowerCase() + '_' + attr] = hash[name][attr];
      });
    }
  });

  // @see https://github.com/brianc/node-sql/blob/master/test/dialects/insert-tests.js
  var q = table.insert(values).returning(model.id()).toQuery();
  debug('%j', q);

  this.conn.query(q, function (err, res) {
    if (err) return cb(err);
    //var ret = { raw: res };

    res.rows.forEach(function (row) {
      _.extend(values, row);
    });

    return cb(err, values);
  });
};

function rel2attributes (rel) {
  var attrs = [];
  rel.model.id().forEach(function (attr) {
    attrs.push(rel.name.toLowerCase() + '_' + attr);
  });
  return attrs;
}

SQL.prototype.update = function (query, model, hash, cb) {
  var table = sql.define({
    name: table_name(model.name),
    columns: model.attributes
  });

  //@TODO: LOT OF DUPLICATION WITH INSERT!
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
    else if (hash[name] === null) {
      // property was set to null. we need to delete the local reference
      //console.log('need to delete ' + name);

      var local_attrs = rel2attributes(rel);
      _.each(local_attrs, function (attr) {
        values[attr] = null;
      });
    }
  });

  var q = table.update(values).where(query.expr.where).toQuery();

  debug('%j', q);

  this.conn.query(q, function (err, res) {
    if (err) return cb(err);
    //var ret = { raw: res };
    res.rows.forEach(function (row) {
      _.extend(values, row);
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

SQL.prototype.load = function (query, model, hash, cb) {
  var rel_name = query.load,
    rel = model.relationships[rel_name],
    foreignModel = rel.model,
    foreign_id;

  // @TODO: for now, stupid heuristic to map foreign id to local attributes
  // instead of using model.map

  where = {};

  // this is duplicated in insert and update!!!! :( :(
  foreignModel.id().forEach(function (attr) {
    // heuristic to guess the name of the foreign key
    // property_name_idattr
    where[attr] = hash[rel_name.toLowerCase() + '_' + attr];
  });

  query.where(where);

  this.select(query, foreignModel, null, cb);
};

SQL.prototype.select = function (query, model, values, cb) {
  var _this = this;
  var table = sql.define({
    name: table_name(model.name),
    columns: model.attributes
  }), tables = {}, q;

  q = table;

  if (query.expr.include) {
    var select = [];
    //var query = user.select(user.name, post.body)
      //.from(user.join(post).on(user.id.equals(post.userId))).toQuery();
    var includes = query.expr.include;
    var joinStmt = table;

    select.push(table.star());

    // SELECT
    includes.forEach(function (rel_name) {
      var rel = model.relationships[rel_name];

      if (!tables[rel.model.name]) {
        tables[rel.model.name] = sql.define({
          name: table_name(rel.model.name),
          columns: rel.model.attributes
        });
      }
      var foreign_table = tables[rel.model.name];

      rel.model.attributes.forEach(function (attr) {
        select.push(foreign_table.as(rel_name)[attr].as(rel_name + '_' + attr));
      });
    });

    q = q.select(select);

    // JOIN
    includes.forEach(function (rel_name) {
      var rel = model.relationships[rel_name];
      var foreign_table = tables[rel.model.name];

      var on;
      if (rel.type === 'hasOne') {
        // user.id.equals(post.userId)
        // @TODO support multiple attr primary keys
        // @TODO heuristic repeated all over the place ;(
        rel.model.id().forEach(function (attr) {
          var local_attr = rel_name.toLowerCase() + '_' + attr;
          var alias = foreign_table.as(rel_name);
          on = table[local_attr].equals(alias[attr]);
          // heuristic to guess the name of the foreign key
          // property_name_idattr
        });
        joinStmt = joinStmt.leftJoin(foreign_table.as(rel_name)).on(on);
      }
      else if (rel.type === 'hasMany') {
        // @TODO this only implemented for 1-to-many relationships
        // @TODO oops, repeated heuristic! only support one attr ID at the moment :(
        // find out how the child model references the parent
        _.each(rel.model.relationships, function (child_rel) {
          if (child_rel.model === model) {
            //found which rel references the parent
            // @TODO ugly heuristic!
            on = foreign_table.as(rel_name)[rel2attributes(child_rel)[0]].equals(table[model.id()[0]]);
          }
        });
        joinStmt = joinStmt.leftJoin(foreign_table.as(rel_name)).on(on);
      }
    });

    q = q.from(joinStmt);
    //console.log(query.text); //'SELECT "user"."name", "post"."body" FROM "user" INNER JOIN "post" ON ("user"."id" = "post"."userId")'

  }
  else {
    q = q.select();
  }

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
    // @TODO dont use limit _only_ if include contains one or more hasMany 
    // relationships. it is fine for 1-to-1 rels
    if (!query.expr.include || !query.expr.include.length) {
      q = q.limit(query.expr.limit);
    }
  }

  if (query.expr.order) {
    var orders = query.expr.order;
    orders.forEach(function (order) {
      var direction = order.direction || 'asc';
      q = q.order(table[order.attribute][direction]);
    });
  }

  q = q.toQuery();

  debug('%j', q);

  this.conn.query(q, function (err, res) {
    if (err) return cb(err);

    var objs = _this.parseRows(res.rows, model, query.expr.include);
    //console.log(objs); process.exit();
    cb(null, objs);
  });
};

/**
 * @TODO: improve performance
 * @TODO: only works for 1-to-1 relationships at the moment
 */
SQL.prototype.parseRows = function (rows, model, includes) {
  var _this = this;
  var objs = [], obj, extractedObj;

  // cache objects so we dont have 2 objects representing the same data
  var cache = {
    store: {},
    get: function (model, obj) {
      var id = JSON.stringify(model.extractId(obj));
      var ret = this.store[model.name] && this.store[model.name][id];
      var hitormiss = 'hit';
      if (!ret) hitormiss = 'miss';
      debug('Cache ' + hitormiss + ' for ' + model.name + '#' + id);
      return ret;
    },
    put: function (model, obj) {
      var id = JSON.stringify(model.extractId(obj));
      this.store[model.name] = this.store[model.name] || {};
      this.store[model.name][id] = obj;
      return obj;
    },
    getOrPut: function (model, obj) {
      var cachedObj = this.get(model, obj);
      if (!cachedObj) {
        cachedObj = this.put(model, obj);
      }
      return cachedObj;
    }
  };

  rows.forEach(function (row) {
    extractedObj = _this._extract_obj_from_row(row, model);
    obj = cache.get(model, extractedObj);
    if (!obj) {
      obj = cache.put(model, extractedObj);
      objs.push(obj);
    }

    includes.forEach(function (include) {
      var rel = model.relationships[include];
      var foreign_model = rel.model;
      var child_obj = _this._extract_obj_from_row(row, foreign_model, include);
      child_obj = cache.getOrPut(foreign_model, child_obj);
      if (rel.type === 'hasOne') {
        obj[include] = child_obj;
      }
      else if (rel.type === 'hasMany') {
        obj[rel.name] = obj[rel.name] || [];
        obj[rel.name].push(child_obj);
      }
    });
  });
  return objs;
};

SQL.prototype._extract_obj_from_row = function (row, model, prefix) {
  var obj = {};
  prefix = prefix && prefix + '_' || '';

  model.attributes.forEach(function (attr) {
    obj[attr] = row[prefix + attr];
  });
  return obj;
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

  var q = table.select(table.count().as('count'));

  // @TODO: code duplication with select :(
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

  q = q.toQuery();

  debug('%j', q);

  this.conn.query(q.text, q.values, function (err, res) {
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
