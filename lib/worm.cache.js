var cache = require('./cache/').memory,
  debug = require('debug')('worm');

/**
 * cache()
 *
 * @TODO non memory cache?
 */
module.exports = {
  get: function (m, obj) {
    var uid, id;
    // get(obj)
    if (!obj) {
      obj = m;
      return obj._$instance;
    }
    // get(Model, obj)
    if (obj._$instance) {
      return obj._$instance;
    }
    // @TODO: search in cache with UID
    id = m.extractId(obj, true);
    if (!id) return false;
    // @TODO: refactor into an instance/model method
    // uid = ModelName#id
    uid = m.name + '#' + id.join('-');
    res = cache.get(uid);
    if (res) {
      debug('Found ' + uid + ' in cache');
    }
    return res;
  },
  put: function ($instance) {
    // make property non enumerable so it doesn't show up on console.log
    var enumerable = false;
    if (process.env.DEBUG) {
      enumerable = true;
    }

    Object.defineProperty($instance.obj, '_$instance',
      { value: $instance, enumerable: enumerable });

    var id = $instance.model.extractId($instance.obj, true);
    if (!id) {
      return $instance;
    }
    // @TODO: refactor into an instance/model method
    uid = $instance.model.name + '#' + id.join('-');
    cache.put(uid, $instance);
    debug('Put ' + uid + ' in cache');
    return $instance;
  },
  clear: function (cb) {
    cache.clear(cb);
  }
};
