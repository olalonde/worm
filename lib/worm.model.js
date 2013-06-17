var model = require('./model/'),
  _ = require('underscore'),
  models = {};

/**
 * worm.model()
 */
var registerModel = function (schema) {
  var m = model(schema);
  //if (models[m.name]) {
    //throw new Error('The model ' + m.name + ' is already registered.');
  //}

  models[m.name] = m;

  // replace all relationships pointing to this model by actual model
  _.each(models, function (model) {
    _.each(model.relationships, function (rel, name) {
      if (rel.model === m.name) rel.model = m;
    });
  });

  return m;
};

var getModel = function (kinda_model) {
  var m;
  if (typeof kinda_model === 'string') {
    m = models[kinda_model];
  }
  else {
    m = kinda_model;
  }

  if (!isModel(m)) {
    throw new Error(kinda_model + ' is not a model');
  }

  return m;
};


var isModel = function (something) {
  return (something instanceof model.Model);
};

module.exports = {
  registerModel: registerModel,
  isModel: isModel,
  getModel: getModel,
  models: models
};
