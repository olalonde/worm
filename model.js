var Model = function (schema) {
  // @todo: validate schema structure!
  this.schema = schema;
  this.name = schema.name;
  this.attributes = schema.attributes;
  this.adapters = schema.adapters;
};

Model.prototype.id = function () {
  //@TODO
  return [ 'id' ];
};

module.exports = function (schema) {
  return new Model(schema);
};

module.exports.Model = Model;
