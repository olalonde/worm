var errors = require('./errors/'),
  query = require('./query/'),
  debug = require('debug')('worm'),
  inspect = require('util').inspect,
  async = require('async'),
  instance = require('./worm.instance'),
  model = require('./worm.model'),
  cache = require('./worm.cache'),
  adapter = require('./worm.adapter'),
  _ = require('underscore');

var worm = module.exports = {
  adapter: adapter.adapter,
  adapters: adapter.adapters,
  _adapters: adapter._adapters, // adapter instances, indexed by label

  cache: cache,

  wrap: instance.wrap,
  unwrap: instance.unwrap,

  model: model.registerModel,
  getModel: model.getModel,
  models: model.models
};

/**
 * get()
 * exists()
 * getAll()
 * save()
 * destroy()
 * @TODO: destroyAll
 * load()
 * remove()
 */
[
  'get',
  'getAll',
  'save',
  'destroy',
  'count',
  'load',
  'remove'
].forEach(function (method) {
  worm[method] = function (something, opts) {
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

    return query(worm.queryCallback(method, something, opts));
  };
});

var execute = function (method, $instance, q, opts, postAdapterCb) {
  opts = opts || {};

  if (!postAdapterCb) {
    postAdapterCb = function (err, res, cb) { cb(err, res); };
  }

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
  }, labels = {
    pre: [],
    middle: [],
    post: []
  };

  function add_task (position, label, task) {
    if (arguments.length === 2) {
      label = position;
      task = label;
      position = 'middle';
    }

    labels[position].push(label);

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

  if (method === 'save') {
    // Avoid saving recursively!
    if ($instance.queued_for_saving && !opts.ignoreQueue) {
      debug('instance already queued for saving');
      return opts.userCallback();
    }
    $instance.queued_for_saving = true;

    // validate
    add_task('pre', 'validates', function validates_task (cb) {
      var res = $instance.validates(),
        err = ($instance.errors.length) ? $instance.errors : null;
      cb(err, res);
    });

    // one-to-many relationships
    // we need to save the parent first so the child knows its parent ID
    add_task('post', 'save hasMany relationships', function save_hasMany_relationships_task (cb) {
      if (opts.deep === false) return cb();

      var subtasks = [];

      _.each($instance.model.hasManyRelationships(), function (rel) {
        if (!$instance.obj[rel.name]) return;

        subtasks.push(function (cb) {
          var $rel = worm.wrap($instance.obj[rel.name]);
          debug('Saving ' + rel.name + ' hasMany relationship');

          // find which property the child uses to reference the parent
          _.each(rel.model.hasOneRelationships(), function (parent_rel) {
            if (parent_rel.model === $instance.model) {
              // assign parent to all childs in the array
              $rel.obj.forEach(function (child) {
                worm.wrap(child).markDirtyRelationship(parent_rel.name);
                child[parent_rel.name] = $instance.obj;
              });
            }
          });

          worm.save($rel).end(function (err, res) {
            cb(err, res);
          });
        });

      });

      async.parallel(subtasks, cb);
    });

    add_task('pre', 'save hasOne relationships', function save_hasOne_relationships_task (cb) {
      if (opts.deep === false) return cb();

      // todo: avoid infinite recursion through cycles.
      // current solution is pretty ugly, refactor this

      var subtasks = [];

      _.each($instance.model.hasOneRelationships(), function (rel, name) {
        if (!$instance.obj[name]) return;
        var $child = worm.wrap(rel.model, $instance.obj[name]);

        // self reference!
        if ($child.obj === $instance.obj) {
          // we cant save the ID now because we still don't know what it is...
          // add task to update it later.

          add_task('post', 'update_self_relationship', function (cb) {
            $instance.markDirty(name);
            $instance.markDirtyRelationship(name);
            worm.save($instance, { deep: false, ignoreQueue: true }).end(function (err, res) {
              cb(err, res);
            });
          });
          return;
        }

        // @TODO: add relationship to dirtyRelationships? only if
        // child was dirty or new?
        $instance.markDirtyRelationship(name);

        subtasks.push(function (cb) {
          worm.save($child).end(function (err, res) {
            // @TODO TEST: unmark instances that have been marked as queued after
            cb(err, res);
          });
        });

      });

      async.parallel(subtasks, cb);
    });
  }

  add_task('middle', 'adapter', function adapter_task (cb) {
    // @TODO: async: only call final callback after all adapters are done
    $instance.model.adapters.forEach(function (adapter) {
      if (typeof adapter === 'string') adapter = worm.adapter(adapter);
      // @TODO: why have this method... adds some useless indirection and
      // confusing. why not move that code to worm.js instead.
      // @TODO: model should contain an optional map for every adapter
      // that will help them map attributes to sql rows/redis keys/etc.
      // for now, we are just passing this.model :/
      var hash;

      if (method === 'load') {
        hash = $instance.obj;
      }
      else {
        hash = $instance.dirtySlice();
      }

      debug('Passing query %j to adapter', inspect(q));
      debug('Passing hash %j to adapter', inspect(hash));

      adapter.execute(q, $instance.model, hash, function (err, res) {
        // @TODO: not sure :D
        //debug(res);
        postAdapterCb(err, res, cb);
      });
    });
  });


  function result (results, position, label) {
    var positions_index = { pre: 0, middle: 1, post: 2 };
    var index =  positions_index[position];
    var subindex = labels[position].indexOf(label);
    return results[index] && results[index][subindex];
  }

  async.series([
    function (cb) {
      async.series(tasks.pre, cb);
    },
    function (cb) {
      async.series(tasks.middle, cb);
    },
    function (cb) {
      async.series(tasks.post, cb);
    }
  ], function (wrapped_err, res) {
    //var validates = result(res, 'validates');
    $instance.queued_for_saving = false;
    var err = wrapped_err && wrapped_err.err || null;
    opts.userCallback(err, result(res, 'middle', 'adapter'));
  });
};

/**
 * queryCallback()
 *
 * Called by query.end()
 */
var queryCallback = function (method, something, opts) {
  var $instance = something,
    m = something,
    cbname = method,
    callbacks;

  opts = opts || {};

  if (method === 'get') {
    cbname = 'getAll';
  }

  /**
   * This callback is used when we fetch fresh data from the database
   *
   * It parses an array of object graphs and wraps/caches its objects.
   *
   * @param Instance $instance Instance on which to apply the loaded data
   */
  var pull_data_callback = function (m) {
    return function (err, res, cb) {
      if (err) return cb(err);

      var $instance;

      if (!Array.isArray(res)) {
        throw new Error('Adapter should always return an array for select queries');
      }

      res.forEach(function (obj, i) {
        $instance = worm.cache.get(m, obj);
        // @TODO: update cached ($instance.obj) with result from
        // query (obj) ?
        // @TODO: also wrap relationships? or should that be part of wrap() code
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
    };
  };

  callbacks = {
    load: function (q, cb) {
      var name = opts,
        rel = $instance.model.relationships[name],
        foreign_model = rel.model;

      opts = { userCallback: cb };

      // @TODO: be able to specify nexted paths. i.e.: user.company.location
      // which whould get company including its location
      // right now, path represents relationship name
      // @TODO: let adapters decide how they want to map local attributes
      // to foreign object id?

      q.type = 'load';
      q.load = name;

      worm.execute(method, $instance, q, opts, function (err, res, cb) {
        pull_data_callback(foreign_model)(err, res, function (err, res) {
          var foreign_obj = res[0];
          $instance.obj[name] = foreign_obj;
          cb(err, foreign_obj);
        });
      });
    },
    // for get/getAll:
    // check if query is memoized?
    getAll: function (q, cb) {
      opts.userCallback = cb;

      $instance = worm.wrap(m, []);

      // check if query is memoized?
      q.type = 'select';
      if (method === 'get') {
        if (q.expr.id) {
          // @TODO: check if object is in cache before forwarding query
        }
        q = q.limit(1);
      }

      worm.execute(method, $instance, q, opts, pull_data_callback(m));
    },
    save: function (q, cb) {
      opts.userCallback = cb;

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

      // @TODO mass save in one SQL statement!
      if ($instance.isCollection()) {
        console.log('col');
        async.map($instance.obj, function (obj, cb) {
          worm.save(worm.wrap(obj)).end(function (err, res) {
            if (err) return cb(err);
            $instance.persisted = true;
            $instance.markNotDirty();
            cb(null, res);
          });
        }, cb);
        return;
      }

      worm.execute(method, $instance, q, opts, function (err, obj, cb) {
        if (err) return cb(err);
        //if (err instanceof errors.ValidationError) {
        //}
        // todo: cache result?
        // todo: wrap as instances?
        _.extend($instance.obj, obj);
        $instance.persisted = true;
        $instance.markNotDirty();
        // save to cache
        worm.cache.put($instance);

        return cb(err, $instance.obj);
      });

    },
    // remove a foreign relation
    // @TODO: support nested paths
    remove: function (q, cb) {
      var path = opts;
      $instance.obj[path] = null;
      $instance.markDirtyRelationship(path);
      worm.save($instance).end(cb);
    },
    destroy: function (q, cb) {
      opts.userCallback = cb;
      q.type = 'destroy';
      q.where($instance.getId());

      worm.execute(method, $instance, q, opts, function (err, res, cb) {
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
      opts.userCallback = cb;
      $instance = worm.wrap(m, []);
      q.type = 'count';
      worm.execute(method, $instance, q, opts);
    }
  };

  return callbacks[cbname];
};

worm.execute = execute;
worm.queryCallback = queryCallback;
