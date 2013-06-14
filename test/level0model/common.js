var $ = require('../../'),
  debug = require('../../lib/debug')('test:common'),
  adapter_name = 'memory', // default adapter
  opts,
  adapter;

adapter = $.adapter($.adapters[adapter_name](opts), 'test');

module.exports.pretest = function (cb) {
  cb();
};
