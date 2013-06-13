var Query = function (wormcb) {
  this.wormcb = wormcb;
};

Query.prototype.end = function (cb) {
  this.wormcb(this, cb);
};

module.exports = function (wormcb) {
  return new Query(wormcb);
}
