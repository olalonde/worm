var Query = function (wormcb) {
  this.wormcb = wormcb;
  this.expr = {};
};

Query.prototype.end = function (cb) {
  this.wormcb(this, cb);
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

Query.prototype.offset = function (offset) {
  this.expr.offset = offset;
  return this;
};

module.exports = function (wormcb) {
  if (typeof wormcb !== 'function') {
    throw new Error('You must specify a callback');
  }
  return new Query(wormcb);
}
