/**
 * @TODO: get rid of this file and use _.js instead
 */
function inherits (ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}

function extend (obj) {
  Array.prototype.slice.call(arguments, 1).forEach(function(source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

function clone (obj) {
  return Array.isArray(obj) ? obj.slice() : extend({}, obj);
}

function each () {

}

module.exports = {
  extend: extend,
  clone: clone,
  each: each,
  inherits: inherits
};
