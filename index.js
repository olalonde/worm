require('./patch'); // patches api helpers everywhere

var model = require('./model'),
  instance = require('./instance');

var worm = {
  adapters: require('./adapters'),
  models: {}
};

worm.adapter = function (adapter, name) {
  name = adapter.name || name;
  worm.adapters[name] = adapter;
  return adapter;
};

worm.model = function (schema) {
  var m = model(schema);
  worm.models[m.name] = m; 
  return m;
};

worm.cache = function (kinda_obj) {
  var obj = kinda_obj, $instance;
  if (kinda_obj instanceof instance.Instance) { 
    $instance = kinda_obj;
    obj = kinda_obj.obj;
  }
  if (obj._$instance) return obj._$instance;
  // @todo: make non enumerable?
  obj._$instance = $instance;
  return $instance;
};

worm.wrap = function (kinda_model, obj) {
  // @todo: chech cache
  var m, $instance;

  if (obj instanceof instance.Instance) 
    return obj;

  if (typeof kinda_model === 'string') {
    m = worm.models[kinda_model];
  }
  else {
    m = kinda_model;
  }

  $instance = worm.cache(instance(m, obj));
  return $instance;
};

worm.unwrap = function ($instance) {
  if (!($instance instanceof instance.Instance))
    return $instance;

  return $instance.obj; 
};

module.exports = worm;

