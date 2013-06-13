var util = require('util'); //@TODO: not browser compatible
var colors = require('colors');

module.exports = function (namespace) {
  return function (something) {
    console.log(namespace.blue + ': ' + util.inspect(something));
  };
};
