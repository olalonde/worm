var _ = require('underscore');

var Model = function (schema) {
  // @todo: validate schema structure!
  this.init(schema);
};

Model.prototype.init = function (schema) {
  this.schema = schema;
  this.name = schema.name;
  this.attributes = schema.attributes;
  this.adapters = schema.adapters;
  this.validates = schema.validates;
  this.validators = schema.validators;
  
  var _this = this;
  _.each(schema.relationships, function (rel, name) { 
    rel.name = name;
  });

  this.relationships = schema.relationships || {};
};

Model.prototype.id = function () {
  //@TODO
  return this.schema.id || [ 'id' ];
};

Model.prototype.getRelationship = function (name) {
  var rel = this.relationships[name];

  if (!rel) {
    throw new Error(this.name + ' does not have a ' + name + ' relationship');
  }

  return rel;
};

/**
 * Returns an hash of relationships for specified type
 *
 * .hasOneRelationships()
 * .hasManyRelationships()
 * .belongsToRelationships()
 */
['hasOne', 'hasMany', 'belongsTo'].forEach(function (rel_type) {
  Model.prototype[rel_type + 'Relationships'] = function () {
    var _this = this;
    var res = {};
    _.each(this.relationships, function (rel) {
      if (rel.type === rel_type) {
        res[rel.name] = rel;
      }
    });
    return res;
  };
});

Model.prototype.extractId = function (obj, toArray) {
  var res = {}, arr = [], id = this.id(), missing_attr = false;

  if (!id.length) return;

  this.id().forEach(function (attr) {
    if (!obj[attr]) return;

    arr.push(obj[attr]);
    res[attr] = obj[attr];
  });

  if (toArray) {
    // one or some attributes missing from ID
    if (id.length > arr.length) return; 
    return arr;
  }
  else {
    // one or some attributes missing from ID
    if (id.length > Object.keys(res).length) return;
    return res;
  }
};

module.exports = function (schema) {
  return new Model(schema);
};

module.exports.Model = Model;
