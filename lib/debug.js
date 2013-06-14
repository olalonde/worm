var util = require('util'); //@TODO: not browser compatible
var colors = require('colors');

module.exports = function (namespace) {
  return function () {
    var args = Array.prototype.slice.call(arguments, 0);
    var out = namespace.blue + ': ';
    args.forEach(function (arg) {
      out += (typeof arg === 'string') ? arg : util.inspect(arg);
    });
    console.log(out);
  };
};
