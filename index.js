var errors = require('./errors'),
  extend = require('./util').extend,
  model = require('./model'),
  instance = require('./instance'),
  query = require('./query'),
  debug = require('./debug')('worm');

var worm = {
  adapters: require('./adapters'),
  models: {}
};

/**
 * adapter()
 */
worm.adapter = function (adapter, name) {
  name = adapter.name || name;
  worm.adapters[name] = adapter;
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
 */
worm.wrap = function (kinda_model, obj) {
  // @todo: chech cache
  var m, $instance;

  if (kinda_model instanceof instance.Instance) 
    return kinda_model;

  if (obj instanceof instance.Instance) 
    return obj;

  if (obj instanceof model.Model) 
    throw new errors.AbstractError('Second argument cannot be a model.');

  // 1 argument
  if (!obj) {
    $instance = worm.cache(kinda_model);
  }
  else {
    m = worm.getModel(kinda_model);
    $instance = worm.cache(instance(m, obj));
  }

  if (!$instance) throw new Error('Could not wrap object');

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
        q = q.limit(1);
      }

      $instance.execute(q, function (err, res) {
        if (err) return cb(err);
        if (!Array.isArray(res)) {
          throw new Error('Adapter should always return an array for select queries');
        }

        if (method === 'get') {
          if (res.length === 0) {
            return res;
          }
          debug(res);
          res = worm.wrap(m, res[0]);
          res.dirtyAttributes = [];
          res.persisted = true;
          res = worm.unwrap(res);
        }
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
      }

      //@TODO: save all childs? parents?

      $instance.execute(q, function (err, obj) {
        //if (err instanceof errors.ValidationError) {
        //}
        // todo: cache result?
        // todo: wrap as instances?
        // @TODO: right now it only works for flat objects
        extend($instance.obj, obj);
        $instance.dirtyAttributes = [];
        $instance.persisted = true;

        return cb(err, $instance.obj); 
      });

    },
    destroy: function (q, cb) {
      q.type = 'destroy';
      $instance.execute(q, function (err, res) {
        //@TODO: remove $instance from cache,
        //and remove all object properties that link to $instance?
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

    debug('calling ' + method);

    return query(worm.queryCallback(method, something)); 
  };
});

module.exports = worm;
