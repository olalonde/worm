var $ = require('../../'),
  should = require('should');

var adapter, User, $oli;

var oli = {
  name_first: 'Olivier',
  name_last: 'Lalonde',
  email: 'olalonde@gmail.com',
  notPersistent: 'dont save me im not in attribute list'
};

describe('initializing a memory adapter', function () {
  it('should not throw an error', function () {
    (function () {
      adapter = $.adapter($.adapters.memory({ namespace: 'test' }));
    }).should.not.throw();
  });
  it('should be accessible from $.adapters', function () {
    should.exist($.adapters);
    $.adapters.should.be.a('object');
    should.exist($.adapters.memory);
    $.adapters.memory.should.equal(adapter);
  });
});

describe('setting up a model', function () {
  it('should not throw an error', function () {
    (function () {
      User = $.model({
        name: 'User',
        attributes: [ 'id', 'name_first', 'name_last', 'email', 'location' ],
        adapters: [ $.adapters.memory ]
      });
    }).should.not.throw();
  });
  it('the model should be accessible from $.models', function () {
    should.exist($.models);
    should.exist($.models.User);
    $.models.User.should.equal(User);
  });
  it('wrapping an object should not throw an error', function () {
    (function () {
      $oli = $.wrap('User', oli);
    }).should.not.throw();
  });
  it('wrapping a wrapped object should do nothing', function () {
      var wrapped = $.wrap('User', $oli);
      wrapped.should.equal($oli);
  });
  it('should be possible to unwrap the object', function () {
    var unwrapped;
    (function () {
      unwrapped = $.unwrap($oli);
    }).should.not.throw();

    unwrapped.should.equal(oli);
  });
  it('wrapping again should return the same wrapped object', function () {
    var $wrapped;
    (function () {
      $wrapped = $.wrap('User', oli);
    }).should.not.throw(); 
    $wrapped.should.equal($oli);
  });
});

