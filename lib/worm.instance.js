var instance = require('./instance/'),
  cache = require('./worm.cache'),
  model = require('./worm.model'),
  debug = require('debug')('worm');

/**
 * wrap()
 *
 * wrap(Model, obj)
 * wrap(Model, instance)
 * wrap(instance)
 * wrap(obj)
 */
var wrap = function (kinda_model, obj) {
  // @TODO: use memcache? redis? as cache instead of memory
  var m, $instance;

  // wrap(instance)
  if (kinda_model instanceof instance.Instance)
    return kinda_model;

  // wrap(something, instance)
  if (obj instanceof instance.Instance)
    return obj;

  // wrap(something, Model)
  if (model.isModel(obj))
    throw new errors.AbstractError('Second argument cannot be a model.');

  // wrap(obj)
  if (!obj) {
    obj = kinda_model;
    $instance = cache.get(obj);
    if (!$instance) {
      throw new Error(obj + ' was never wrapped previously. Please use $.wrap(Model, obj) first.');
    }
  }
  // wrap(Model, obj)
  else {
    m = model.getModel(kinda_model);
    // retrieve from cache
    $instance = cache.get(m, obj);
    if (!$instance) {
      debug('Cache miss');
      // could not retrieve from cache
      $instance = instance(m, obj);
      // save to cache
      cache.put($instance);

      // Wrap foreign relationships (recursively!)
      var name, rel, $res;
      for (name in m.relationships) {
        if (!obj[name]) continue;
        rel = m.relationships[name];

        $res = wrap(rel.model, obj[name]);
        obj[name] = $res.obj; //make sure we dont have 2 copies of the same object
      }
    }
  }

  if (!$instance)
    throw new Error('Could not wrap ' + kinda_model);

  return $instance;
};

/**
 * unwrap()
 */
var unwrap = function ($instance) {
  if (!($instance instanceof instance.Instance))
    return $instance;

  return $instance.obj;
};

var isInstance = function (something) {
  return (something instanceof instance.Instance);
};

module.exports = {
  wrap: wrap,
  unwrap: unwrap,
  isInstance: isInstance
};
