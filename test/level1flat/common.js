var $ = require('../../'),
  debug = require('../../lib/debug')('test:common'),
  adapter_name = 'memory', 
  opts,
  adapter;

if (process.env.ADAPTER) {
  adapter_name = process.env.ADAPTER;
}

if (adapter_name === 'sql') {
  opts = 'postgres://localhost/worm-test';
}

adapter = $.adapter($.adapters[adapter_name](opts), 'test');

module.exports.pretest = function (cb) {
  debug('Flushing database');
  adapter.flush(cb);
};
