var instance = require('./instance/'),
  util = require('util'),
  cache = require('./worm.cache'),
  model = require('./worm.model'),
  _ = require('underscore'),
  debug = require('debug')('worm');

/**
 * wrap()
 *
 * wrap(Model, obj)
 * wrap(Model, instance)
 * wrap(instance)
 * wrap(obj)
 */
var wrap = function (m, obj) {
  // @TODO: use memcache? redis? as cache instead of memory
  var $instance;

  // wrap(obj)
  if (!obj) {
    obj = m;
    m = null;
  }

  // wrap(instance)
  if (isInstance(m))
    return m;

  // wrap(something, instance)
  if (isInstance(obj))
    return obj;

  // wrap(something, Model)
  if (model.isModel(obj))
    throw new TypeError('Cannot wrap a model without an object.');

  // wrap(obj)
  if (!m) {
    $instance = cache.get(obj);
    if (!$instance) {
      throw new Error(util.inspect(obj) + ' was never wrapped previously. Please use $.wrap(Model, obj) first.');
    }
    return $instance;
  }

  // wrap(Model, obj)
  m = model.getModel(m);

  // retrieve from cache
  $instance = cache.get(m, obj);

  if ($instance) {
    debug('Cache hit');
    return $instance;
  }

  debug('Cache miss');
  $instance = instance(m, obj);

  // save to cache
  cache.put($instance);

  // wrapping a collection
  if (Array.isArray(obj)) {
    obj.forEach(function (ele) {
      wrap(m, ele);
    });
    return $instance;
  }

  // wrapping an object

  // save foreign objects/collections (recursively!)
  _.each(m.relationships, function (rel) {
    if (!obj[rel.name]) return;
    var $res = wrap(rel.model, obj[rel.name]);
    obj[rel.name] = $res.obj; //make sure we dont have 2 copies of the same object
  });

  if (!$instance) throw new Error('Could not wrap ' + m);

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
