var Memory = function (opts) {
  this.namespace = '' || opts.namespace;
}

Memory.prototype.name = 'memory';

Memory.prototype.blabla = function () {


}

module.exports = function (opts) {
  return new Memory(opts);
}
