var Model = function (schema) {
  // @todo: validate schema structure!
  this.schema = schema;
  this.name = schema.name;
}

module.exports = function (schema) {
  return new Model(schema);
};

module.exports.Model = Model;
