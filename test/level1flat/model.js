var $ = require('../../'),
  common = require('./common'),
  should = require('should');

var adapter, User, $oli;

var oli = {
  name_first: 'Olivier',
  name_last: 'Lalonde',
  email: 'olalonde@gmail.com',
  notPersistent: 'dont save me im not in attribute list'
};

describe('initializing a memory adapter', function () {
  before(function (done) {
    common.pretest(done);
  });

  it('should not throw an error', function () {
    (function () {
      adapter = $.adapter($.adapters.memory({ namespace: 'test' }));
    }).should.not.throw();
  });
  it('should be accessible from $._adapters', function () {
    should.exist($._adapters);
    $.adapters.should.be.a('object');
    should.exist($._adapters.memory);
    $._adapters.memory.should.equal(adapter);
  });
});

describe('setting up a model', function () {
  it('should not throw an error', function () {
    (function () {
      // @TODO: it should be possible to set a "map" for each adapter, to
      // help them translate our attributes to their data store.
      // adapters should be able to work without a map by making
      // assumptions
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
  it('the wrapped object should be marked as dirty', function () {
    should.ok($oli.isDirty());
  });
  it('the wrapped object should be marked as new', function () {
    should.ok($oli.isNew());
  });

  //@TODO
  //it('wrapping an object (Model(obj)) should not throw an error', function () {
    //(function () {
      //$oli = User(oli);
    //}).should.not.throw();
  //});
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
  it('wrapping again without model argument should return the same wrapped object', function () {
    var $wrapped;
    (function () {
      $wrapped = $.wrap(oli);
    }).should.not.throw(); 
    $wrapped.should.equal($oli);
  });
});

