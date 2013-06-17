var $ = require('../../'),
  debug = require('debug')('worm:test'),
  adapter_name = 'sql', // default adapter
  opts,
  adapter;

if (process.env.ADAPTER) {
  adapter_name = process.env.ADAPTER;
}

if (adapter_name === 'sql') {
  opts = 'postgres://localhost/level3';
  if (process.env.TRAVIS) {
    opts = 'postgres://postgres:@localhost/level3';
  }
}

adapter = $.adapter($.adapters[adapter_name](opts), 'test3');

var pretest = function (cb) {
  debug('Flushing database');

  $.cache.clear(next);

  // @TODO: replace this by $.destroyAll
  function next() {
    if (adapter_name === 'sql') {
      adapter.raw.query('TRUNCATE TABLE posts;TRUNCATE TABLE comments;', cb);
    }
    else {
      adapter.flush(cb);
    }
  }
};

var Post = $.model({
  name: 'Post',
  attributes: [ 'id', 'title' ],
  relationships: {
    comments: {
      type: 'hasMany',
      model: 'Comment'
    }
  },
  adapters: [ 'test3' ]
});

var Comment = $.model({
  name: 'Comment',
  attributes: [ 'id', 'text', 'post_id' ],
  relationships: {
    post: {
      // @TODO belongsTo and see in what way it is different from hasOne
      type: 'hasOne',
      model: 'Post'
    }
  },
  adapters: [ 'test3' ]
});

module.exports = {
  pretest: pretest,
  Post: Post,
  Comment: Comment
};
