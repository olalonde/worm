var Model = function (schema) {
  // @todo: validate schema structure!
  this.schema = schema;
  this.name = schema.name;
  this.attributes = schema.attributes;
  this.adapters = schema.adapters;
  this.validates = schema.validates;
  this.validators = schema.validators;
};

Model.prototype.id = function () {
  //@TODO
  return this.schema.id || [ 'id' ];
};

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
