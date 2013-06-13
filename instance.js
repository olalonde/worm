var debug = require('./debug')('instance');

var Instance = function (model, obj) {
  this.dirtyAttributes = model.attributes;
  this.persisted = false; // was it loaded through a database call?
  this.obj = obj || {};
  this.destroyed = false; 
  this.errors = [];

  // @TODO: copy object so we can compare later to find dirty attributes
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
    // @TODO: why have this method... adds some useless indirection and
    // confusing. why not move that code to worm.js instead.
    // @TODO: model should contain an optional map for every adapter
    // that will help them map attributes to sql rows/redis keys/etc.
    // for now, we are just passing this.model :/
    var values = _this.sliceDirtyAttributes();
    if (query.type === 'destroy') {
      values = _this.getId();
    }
    adapter.execute(query, _this.model, values, function (err, res) {
      // @TODO: not sure :D
      debug(res);
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

Instance.prototype.isPersisted = function () {
  return this.persisted;
};

Instance.prototype.isGettable = function () {
  return !!this.getId();
};

Instance.prototype.isNew = function () {
  return (!this.persisted && !this.isGettable());
};

Instance.prototype.isDirty = function () {
  return (this.dirtyAttributes.length > 0);
};

Instance.prototype.isDestroyed = function () {
  return this.destroyed;
};

//@TODO: rewrite to support async validators
//@TODO: validate childs/parents recursively ??
//@TODO: way to check validate quickly. return as soon as there is an
//error. drawback is that all errors will not be available in
//this.errors
/**
 * Errors are made available through the errors property
 *
 * @return Boolean true if validates, false otherwise
 */
Instance.prototype.validates = function () {
  var attributes, 
    validator_name, 
    validator, 
    context, 
    validates,
    value,
    errors = [],
    _this = this;

  // @TODO: errors should be indexed by attribute name?
  this.errors = []; //reset errors property

  for (validator_name in this.model.validates) {
    attributes = this.model.validates[validator_name];
    validator = this.model.validators[validator_name];

    // for { args: [/.../i], attributes: [] } syntax
    if (!Array.isArray(attributes)) {
      validator = validator.apply(null, attributes.args);
      attributes = attributes.attributes;
    }

    if (!validator) {
      throw new Error('Could not find validaor "' + validator_name + '"');
    }
    if (!Array.isArray(attributes)) {
      throw new Error('You need to specify an attributes array for validator ' + validator_name);
    }

    attributes.forEach(function (attr) {
      value = _this.obj[attr];
      context = { 
        error: {
          attribute: attr, 
          value: value 
        }, 
        obj: _this.obj
      };
      validates = true; // validate by default

      validates = validator.apply(context, [value, attr]);

      if (!validates) {
        errors.push(context.error);
      } 
    });
  }
  this.errors = (errors.length) ? errors : [];

  return !(errors.length);
};

module.exports = function (model, obj) {
  return new Instance(model, obj);
};

module.exports.Instance = Instance;
