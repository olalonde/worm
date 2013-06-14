var errors = require('./errors'),
  extend = require('./util').extend,
  cache = require('./cache'),
  model = require('./model'),
  instance = require('./instance'),
  query = require('./query'),
  debug = require('./debug')('worm');

var worm = {
  adapters: require('./adapters'),
  _adapters: {}, // adapter instances, indexed by label
  models: {}
};

/**
 * Get or register an adapter
 *
 * adapter()
 *
 * @argument String|adaper adapter
 * @argument String label Optional label that will be used to reference
 * to the adapter
 */
worm.adapter = function (adapter, label) {
  if (typeof adapter === 'string') {
    if(!worm._adapters[adapter])
      throw new Error('Adapter ' + adapter + ' does not exits.');
    return worm._adapters[adapter];
  }

  label = label || adapter.name;
  worm._adapters[label] = adapter;
  return adapter;
};

/**
 * model()
 */
worm.model = function (schema) {
  var m = model(schema);
  worm.models[m.name] = m; 
  return m;
};

/**
 * cache()
 *
 * @TODO non memory cache?
 */
worm.cache = {
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
    $instance.obj._$instance = $instance;
    var id = $instance.model.extractId($instance.obj, true);
    if (!id) {
      return $instance;
    }
    // @TODO: refactor into an instance/model method
    uid = m.name + '#' + id.join('-');
    cache.put(uid, $instance);
    debug('Put ' + uid + ' in cache');
    return $instance;
  },
  clear: function () {
    cache.clear();
  }
};

/**
 * helpers
 */
worm.getModel = function (kinda_model) {
  if (typeof kinda_model === 'string') {
    m = worm.models[kinda_model];
  }
  else {
    m = kinda_model;
  }
  return m;
};

/**
 * wrap()
 *
 * wrap(Model, obj)
 * wrap(Model, instance)
 * wrap(instance)
 * wrap(obj)
 */
worm.wrap = function (kinda_model, obj) {
  // @todo: chech cache
  var m, $instance;

  // wrap(instance)
  if (kinda_model instanceof instance.Instance) 
    return kinda_model;

  // wrap(something, instance)
  if (obj instanceof instance.Instance) 
    return obj;

  // wrap(something, Model)
  if (obj instanceof model.Model) 
    throw new errors.AbstractError('Second argument cannot be a model.');

  // wrap(obj)
  if (!obj) {
    obj = kinda_model;
    $instance = worm.cache.get(obj);
    if (!$instance) {
      throw new Error('This object was never wrapped previously. Please use $.wrap(Model, obj) first.');
    }
  }
  // wrap(Model, obj)
  else {
    m = worm.getModel(kinda_model);
    // retrieve from cache
    $instance = worm.cache.get(m, obj);
    if (!$instance) {
      debug('Cache miss');
      // could not retrieve from cache
      $instance = instance(m, obj);
      // save to cache
      worm.cache.put($instance);
    }
  }

  if (!$instance) 
    throw new Error('Could not wrap ' + kinda_model);

  return $instance;
};

/**
 * unwrap()
 */
worm.unwrap = function ($instance) {
  if (!($instance instanceof instance.Instance))
    return $instance;

  return $instance.obj; 
};


/**
 * Query helpers
 */

/**
 * queryCallback()
 *
 * Called by query.end()
 */
worm.queryCallback = function (method, something) {
  var $instance = something, 
    m = something,
    cbname = method,
    callbacks;

  if (method === 'get') {
    cbname = 'getAll';
  }

  callbacks = {
    // for get/getAll:
    // check if query is memoized?
    getAll: function (q, cb) {
      $instance = worm.wrap(m, []);

      // check if query is memoized?
      q.type = 'select';
      if (method === 'get') {
        if (q.expr.id) {
          // @TODO: check if object is in cache before forwarding query
        }
        q = q.limit(1);
      }

      debug(q);

      $instance.execute(q, function (err, res) {
        var $instance;
        if (err) return cb(err);
        if (!Array.isArray(res)) {
          throw new Error('Adapter should always return an array for select queries');
        }

        res.forEach(function (obj, i) {
          $instance = worm.cache.get(m, obj);
          // @TODO: update cached ($instance.obj) with result from
          // query (obj) ?
          if (!$instance) {
            $instance = worm.wrap(m, obj);
            worm.cache.put($instance);
          }
          $instance.persisted = true;
          $instance.markNotDirty();
          res[i] = $instance.obj;
        });

        // get: only return one object not array
        if (method === 'get') {
          if (res.length > 0) {
            res = res[0];
          }
        }

        // @TODO: memoize query + results? what to do if some other
        // code inserts a new row... memoization will fail. maybe mark
        // "model collections" as dirty as well when save() is 
        // executed???? wth! :)
        cb(err, res);
      });
    },
    save: function (q, cb) {
      // was not loaded from database
      if ($instance.isProbablyNew()) {
        q.type = 'create';
        // the id (aka primary key) is set
        if ($instance.isGettable()) {
          q.type = 'upsert';
        }
      }
      else if ($instance.isDirty()) {
        q.type = 'update';
        q.where($instance.getId());
      }
      else {
        debug('Called save but obj is not new or dirty');
        return cb(null, $instance.obj);
      }

      //@TODO: save all childs? parents?

      $instance.execute(q, function (err, obj) {
        //if (err instanceof errors.ValidationError) {
        //}
        // todo: cache result?
        // todo: wrap as instances?
        // @TODO: right now it only works for flat objects
        extend($instance.obj, obj);
        $instance.persisted = true;
        $instance.markNotDirty();
        // save to cache
        worm.cache.put($instance);

        return cb(err, $instance.obj); 
      });

    },
    destroy: function (q, cb) {
      q.type = 'destroy';
      q.where($instance.getId());

      $instance.execute(q, function (err, res) {
        //@TODO: remove $instance from cache?
        //and remove all object properties that link to $instance?
        $instance.destroyed = true;
        $instance.persisted = false;
        $instance.markDirty();
        return cb(err, res);
      });
    }
  };

  return callbacks[cbname];
};

/**
 * get()
 * exists()
 * getAll()
 * save()
 * destrou()
 */
['get', 'getAll', 'save', 'destroy'].forEach(function (method) {
  worm[method] = function (something) {
    var q;
    if (method === 'get' || method === 'getAll') {
      // model
      something = worm.getModel(something);
    }
    else {
      // instance
      something = worm.wrap(something);
    }

    debug('calling worm.' + method + '()');

    return query(worm.queryCallback(method, something)); 
  };
});

module.exports = worm;
