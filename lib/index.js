var errors = require('./errors'),
  extend = require('./util').extend,
  cache = require('./cache'),
  model = require('./model'),
  instance = require('./instance'),
  query = require('./query'),
  debug = require('./debug')('worm'),
  async = require('async'),
  _ = require('underscore');

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
  //if (worm.models[m.name]) {
    //throw new Error('The model ' + m.name + ' is already registered.');
  //}
  worm.models[m.name] = m;

  // replace all relationships pointing to this model by actual model
  _.each(worm.models, function (model) {
    _.each(model.relationships, function (rel, name) {
      if (rel.model === m.name) rel.model = m;
    });
  });

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
    uid = $instance.model.name + '#' + id.join('-');
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
  var m;
  if (typeof kinda_model === 'string') {
    m = worm.models[kinda_model];
  }
  else {
    m = kinda_model;
  }
  return m;
};

worm.initInstance = function () {
  var $instance = instance(m, obj);
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
      throw new Error(obj + ' was never wrapped previously. Please use $.wrap(Model, obj) first.');
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

      // Wrap foreign relationships (recursively!)
      var name, rel;
      for (name in m.relationships) {
        rel = m.relationships[name];
        if (obj[name]) {
          worm.wrap(rel.model, obj[name]);
        }
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
worm.unwrap = function ($instance) {
  if (!($instance instanceof instance.Instance))
    return $instance;

  return $instance.obj;
};

worm.execute = function (method, $instance, q, cb) {
  // @TODO refactor this code into a standalone library?
  // @TODO:
  // lifecycle hooks + events depending on query type
  // pre-validate
  // validate
  // post-validate
  // etc. etc.
  // pre-save, pre-upsert, pre-destroy etc.
  // post-save, post-destroy, etc.

  var tasks = {
    pre: [],
    middle: [],
    post: []
  },
  labels = [];

  function add_task (position, label, task) {
    if (arguments.length === 2) {
      label = position;
      task = label;
      position = 'middle';
    }
    labels.push(label);

    // wrap error: identify which task threw error
    tasks[position].push(function (cb) {
      task(function (err, res) {
        if (err) {
          err = { err: err, task: label };
        }
        cb(err, res);
      });
    });
  }

  function result (results, label) {
    return results[labels.indexOf(label)];
  }

  function adapter_task (cb) {
    // @TODO: async: only call final callback after all adapters are done
    $instance.model.adapters.forEach(function (adapter) {
      if (typeof adapter === 'string') adapter = worm.adapter(adapter);
      // @TODO: why have this method... adds some useless indirection and
      // confusing. why not move that code to worm.js instead.
      // @TODO: model should contain an optional map for every adapter
      // that will help them map attributes to sql rows/redis keys/etc.
      // for now, we are just passing this.model :/
      var dirty_slice = $instance.dirtySlice();
      adapter.execute(q, $instance.model, dirty_slice, function (err, res) {
        // @TODO: not sure :D
        //debug(res);
        cb(err, res);
      });
    });
  }

  if (method === 'save') {
    // validate
    add_task('pre', 'validates', function validates_task (cb) {
      var res = $instance.validates(),
        err = ($instance.errors.length) ? $instance.errors : null;
      cb(err, res);
    });
    add_task('pre', 'save_relationships', function save_relationships_task (cb) {
      // todo: avoid infinite recursion. mark as in this function?
      // current solution is kind of ugly, refactor this
      var subtasks = [];
      $instance.queued = true;
      _.each($instance.model.relationships, function (rel, name) {
        if (!$instance.obj[name]) return;
        var $child = worm.wrap(rel.model, $instance.obj[name]);
        $child.queued = true;
        subtasks.push(function (cb) {
          (worm.save($child).cb())(function (err, res) {
            // @TODO: add relationship to dirtyRelationships? only if
            // child was dirty or new?
            $instance.markDirtyRelationship(name);

            // @TODO TEST: unmark instances that have been marked as queued after
            $child.queued = false;
            cb(err, res);
          });
        });
      });
      $instance.queued = false;
      async.parallel(subtasks, cb);
    });
  }

  add_task('middle', 'adapter', adapter_task);

  tasks = tasks.pre.concat(tasks.middle).concat(tasks.post);

  async.series(tasks, function (wrapped_err, res) {
    //var validates = result(res, 'validates');
    var err = wrapped_err && wrapped_err.err || null;
    cb(err, result(res, 'adapter'));
  });
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

      //debug(q);

      worm.execute(method, $instance, q, function (err, res) {
        if (err) return cb(err);

        var $instance;

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

      worm.execute(method, $instance, q, function (err, obj) {
        if (err) return cb(err);
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

      worm.execute(method, $instance, q, function (err, res) {
        if (err) return cb(err);
        //@TODO: remove $instance from cache?
        //and remove all object properties that link to $instance?
        $instance.destroyed = true;
        $instance.persisted = false;
        $instance.markDirty();
        return cb(err, res);
      });
    },
    count: function (q, cb) {
      $instance = worm.wrap(m, []);
      q.type = 'count';
      worm.execute(method, $instance, q, cb);
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
[ 
  'get',
  'getAll',
  'save',
  'destroy',
  'count'
].forEach(function (method) {
  worm[method] = function (something) {
    var q;
    if (method === 'get' || method === 'getAll' || method === 'count') {
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
