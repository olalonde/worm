// In this file, we add api helpers everywhere by monkey 
// patching. That way we can keep an elegant design with 
// low coupling in the other files.

var worm = require('./'),
  Model = require('./model').Model;

// Model should now be able to wrap objects this way: Model(obj)

  // save prototype
  var proto = Model.prototype;
  // set wrap function
  Model.prototype = worm.wrap;
  // put back prototype
  for (var k in proto) {
    Model.prototype[k] = proto[k];
  }
