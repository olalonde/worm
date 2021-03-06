var debug = require('debug')('worm:cache'),
  inspect = require('util').inspect;

// @TODO make this a class so we can instantiate multiple caches
// would be nice if we could re use for SQL adapter

// Taken from https://github.com/ptarjan/node-cache

var cache = {};
function now () { return (new Date()).getTime(); }
var hitCount = 0;
var missCount = 0;

exports.cache = cache;

exports.put = function(key, value, time, timeoutCallback) {
  debug(key + ' = %s ' + (time ? '(@'+time+')' : ''), value);
  var oldRecord = cache[key];
  if (oldRecord) {
    clearTimeout(oldRecord.timeout);
  }

  var expire = time + now();
  var record = {value: value, expire: expire};

  if (!isNaN(expire)) {
    var timeout = setTimeout(function() {
      exports.del(key);
      if (typeof timeoutCallback === 'function') {
        timeoutCallback(key);
      }
    }, time);
    record.timeout = timeout;
  }

  cache[key] = record;
};

exports.del = function(key) {
  delete cache[key];
};

exports.clear = function (cb) {
  if (typeof cb !== 'function') {
    throw new TypeError('You need to pass a callback to cache.clear()');
  }
  cache = {};
  cb();
};

exports.get = function(key) {
  var data = cache[key];
  if (typeof data != 'undefined') {
    if (isNaN(data.expire) || data.expire >= now()) {
      hitCount++;
      return data.value;
    } else {
      // free some space
      missCount++;
      exports.del(key);
    }
  }
  return null;
};

exports.size = function() { 
  var size = 0, key;
  for (key in cache) {
    if (cache.hasOwnProperty(key)) 
      if (exports.get(key) !== null)
        size++;
  }
  return size;
};

exports.memsize = function() { 
  var size = 0, key;
  for (key in cache) {
    if (cache.hasOwnProperty(key)) 
      size++;
  }
  return size;
};

exports.hits = function() {
  return hitCount;
};

exports.misses = function() {
  return missCount;
};
