/**
 * @TODO: move validation stuff to model? that way we could extract
 * model as a standalone module that can actually be useful.
 *
 * @TODO: instance should probably not know about adapters. the glue
 * between them should instead be made by worm.js
 */

var debug = require('debug')('worm:instance'),
  _ = require('underscore'),
  util = require('./util');

var Instance = function (model, obj) {
  this.dirtyAttributes = model.attributes;
  this.dirtyRelationships = [];
  this.persisted = false; // was it loaded through a database call?
  this.obj = obj || {};
  this.destroyed = false; 
  this.errors = [];
  // holds a copy of the obj. we can then use it to compare attributes
  // that have changed when calling isDirty
  this.shadow = null;

  // @TODO: copy object so we can compare later to find dirty attributes
  this.model = model;
};

Instance.prototype.dirtySlice = function () {
  if (!this.isDirty()) return;

  var _this = this,
    res = {};

  var dirty = [].concat(this.dirtyAttributes).concat(this.dirtyRelationships);

  dirty.forEach(function (key) {
    if (_this.obj[key] !== undefined) {
      res[key] = _this.obj[key];
    }
  });

  return res;
};

/**
 * use last db interaction time on relationships to determine
 * if it is dirty? we could timestamp all db operations on instances
 * and use that to know if a relationship is dirty?
 */
Instance.prototype.markDirtyRelationship = function (relationship) {
  this.dirtyRelationships.push(relationship);
};

Instance.prototype.isProbablyNew = function () {
  return (this.isDirty() && !this.persisted);
};

Instance.prototype.getId = function () {
  var res = {};
  attrs = this.model.id();

  for (var i = 0; i < attrs.length; i++) {
    if (!this.obj[attrs[i]]) return false;
    res[attrs[i]] = this.obj[attrs[i]];
  }

  return res;
};

Instance.prototype.isPersisted = function () {
  return this.persisted;
};

Instance.prototype.isGettable = function () {
  return !!this.getId();
};

Instance.prototype.isNew = function () {
  return (!this.persisted && !this.isGettable());
};

// shallow copy this.obj to this.shadow
// @TODO: maybe shallow is not good enough. we need to check
// the model to make sure what is and what is not a "foreign object"?
// or maybe not. lol
Instance.prototype.markNotDirty = function () {
  this.dirtyAttributes = [];
  this.dirtyRelationships = [];
  this.shadow = util.clone(this.obj);
};

Instance.prototype.markDirty = function () {
  this.dirtyAttributes = this.model.attributes;
  this.shadow = null;
};

Instance.prototype.refreshDirty = function () {
  // diff obj & shadow
  //@TODO: use model to know what is and what is not a "foreign object". everything that is not a foreign object should be compared?
  if (!this.shadow) {
    this.dirtyAttributes = this.model.attributes;
    this.dirtyRelationships = _.keys(this.model.relationships) || [];
    return;
  }

  var _this = this;

  this.dirtyRelationships = [];
  _.each(this.model.relationships, function (rel, name) {
    if (_this.shadow[name] !== _this.obj[name]) {
      _this.dirtyRelationships.push(name);
    }
  });

  this.dirtyAttributes = [];
  this.model.attributes.forEach(function (attr) {
    if (_this.shadow[attr] !== _this.obj[attr]) {
      _this.dirtyAttributes.push(attr);
    }
  });
};

Instance.prototype.isDirty = function () {
  this.refreshDirty();
  return (this.dirtyAttributes.length > 0 || this.dirtyRelationships.length > 0);
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
    errors = [],
    _this = this;

  // @TODO: errors should be indexed by attribute name?
  this.errors = []; //reset errors property

  function validate_attr (validator) {
    return function (attr) {
      var value = _this.obj[attr],
        context = { 
          error: {
            attribute: attr, 
            value: value 
          }, 
          obj: _this.obj
        }, 
        validates = true; // validate by default

      validates = validator.apply(context, [value, attr]);

      if (!validates) {
        errors.push(context.error);
      } 
    };
  }

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

    attributes.forEach(validate_attr(validator));
  }

  this.errors = (errors.length) ? errors : [];

  return !(errors.length);
};

module.exports = function (model, obj) {
  return new Instance(model, obj);
};

module.exports.Instance = Instance;
