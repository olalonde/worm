var util = require('util'),
  WhereExpression = require('expressionist')([
    'or', 'and', 'eql', 'notEql', 'in' //by order of precedence??
  ]);
  /*,
  OrderExpression = require('expressionist')([
    'asc', 'desc', 'and'
  ]);
  */

var Query = function (wormcb) {
  this.wormcb = wormcb;
  this.expr = {};
};

Query.prototype.end = function (cb) {
  this.wormcb(this, cb);
};

// cb is like end except it returns a callback
// that can be used in combination with async.each for
// example
//
// @see test/level1flat/integration.js
//
Query.prototype.cb = function (cb) {
  return this.end.bind(this);
};

Query.prototype.id = function (id) {
  this.expr.id = id;
  return this;
};

// @TODO: Should be able to accept a 'limit expression'
Query.prototype.limit = function (limit) {
  this.expr.limit = limit;
  return this;
};

// @TODO: take other kind of arguments
// it should be able to create complex nested expressions
Query.prototype.where = function (hash) {
  var builder;
  if (typeof hash === 'function') {
    builder = hash;
    this.expr.where = builder(WhereExpression.start);
    //console.log(util.inspect(this.where.pretty(), null, 15));
  }
  else {
    this.expr.where = hash;
  }
  return this;
};
/**
 * @argument Array order
 */
Query.prototype.order = function (orders) {
  var res = [];
  orders.forEach(function (order) {
    if (/^\-/.test(order)) {
      res.push({ attribute: order.substr(1), direction: 'desc' });
    }
    else {
      res.push({ attribute: order });
    }
  });

  this.expr.order = res;
  return this;
};

Query.prototype.offset = function (offset) {
  this.expr.offset = offset;
  return this;
};

module.exports = function (wormcb) {
  if (typeof wormcb !== 'function') {
    throw new Error('You must specify a callback');
  }
  return new Query(wormcb);
};
