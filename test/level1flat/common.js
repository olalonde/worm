var $ = require('../../'),
  debug = require('debug')('worm:test'),
  adapter_name = 'sql', // default adapter
  opts,
  adapter;

if (process.env.ADAPTER) {
  adapter_name = process.env.ADAPTER;
}

if (adapter_name === 'sql') {
  opts = 'postgres://localhost/level1';
  if (process.env.TRAVIS) {
    opts = 'postgres://postgres:@localhost/level1';
  }
}

adapter = $.adapter($.adapters[adapter_name](opts), 'test1');

module.exports.pretest = function (cb) {
  debug('Flushing database');

  $.cache.clear(next);

  function next() {
    if (adapter_name === 'sql') {
      adapter.raw.query('TRUNCATE TABLE users;', cb);
    }
    else {
      adapter.flush(cb);
    }
  }
};
