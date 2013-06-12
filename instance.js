var Instance = function (model, obj) {
  this.obj = obj || {};
  this.model = model;
}

module.exports = function (model, obj) {
  return new Instance(model, obj);
}

module.exports.Instance = Instance;
