var inherits = require('util').inherits,
  Instance = require('./Instance');

var Collection = function () {
  Instance.apply(this, arguments);
};

inherits(Collection, Instance);

Collection.prototype.isCollection = function () {
  return true;
};


module.exports = Collection;

