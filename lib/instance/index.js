var Instance = require('./Instance'),
  Collection = require('./Collection');

module.exports = function (model, obj) {
  if (Array.isArray(obj)) {
    return (new Collection(model, obj));
  }

  return (new Instance(model, obj));
};

module.exports.Instance = Instance;
module.exports.Collection = Collection;
