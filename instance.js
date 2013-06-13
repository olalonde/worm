var Instance = function (model, obj) {
  this.dirtyAttributes = model.attributes;
  this.persisted = false; // was it loaded through a database call?
  this.obj = obj || {};
  this.model = model;
};

Instance.prototype.execute = function (query, cb) {
  var _this = this;
  // @TODO:
  // lifecycle events depending on query type
  // pre-validate
  // validate
  // post-validate
  // etc. etc.
  // pre-save, pre-upsert, pre-destroy etc.
  // post-save, post-destroy, etc.

  // @TODO: async: only call final callback after all adapters are done
  this.model.adapters.forEach(function (adapter) {
    // @TODO: model should contain an optional map for every adapter
    // that will help them map attributes to sql rows/redis keys/etc.
    // for now, we are just passing this.model :/
    var dirty_attributes = _this.sliceDirtyAttributes();
    adapter.execute(query, _this.model, dirty_attributes, function (err, res) {
      // @TODO: not sure :D
      cb(err, res);
    });
  });
};

Instance.prototype.sliceDirtyAttributes = function () {
  if (!this.isDirty()) return;
  
  var _this = this,
    res = {};

  this.dirtyAttributes.forEach(function (attribute) {
    if (_this.obj[attribute] != undefined) {
      res[attribute] = _this.obj[attribute];
    }
  });

  return res;
};

Instance.prototype.isProbablyNew = function () {
  return (this.isDirty() || !this.persisted);
};

Instance.prototype.getId = function () {
  var res = {};
  attrs = this.model.id();

  for (var i = 0; i < attrs.length; i++) {
    if (!this.obj[attrs[i]]) return false;
    res[attrs[i]] = this.obj[attrs[i]];
  }

  return res;
}

Instance.prototype.isGettable = function () {
  return !!this.getId();
};

Instance.prototype.isNew = function () {
  return (!this.persisted && !this.isGettable());
};

Instance.prototype.isDirty = function () {
  return (this.dirtyAttributes.length > 0);
};

module.exports = function (model, obj) {
  return new Instance(model, obj);
};

module.exports.Instance = Instance;
