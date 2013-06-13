var $ = require('../../'),
  should = require('should');

$.adapter($.adapters.memory(), 'memory');

var User = $.model({
  name: 'User',
  attributes: [ 'id', 'name_first', 'name_last', 'email', 'location' ],
  adapters: [ $.adapter('memory') ]
});

// or
User = $.models.User;

var oli = {
  name_first: 'Olivier',
  name_last: 'Lalonde',
  email: 'olalonde@gmail.com',
  notPersistent: 'dont save me im not in attribute list'
};

var $oli = $.wrap(User, oli);

describe('saving the user', function () {
  var err;
  before(function (done) {
    $.save($oli).end(function (_err, _user) {
      err = _err;
      done();
    });
  });

  it('should not return an error', function () {
    should.ok(!err);
  });

  it('user should not be marked as destroyed', function () {
    should.ok($oli.isDestroyed() === false);
  });

  it('user should not be marked as new', function () {
    should.ok($oli.isNew() === false);
  });

  it('user should not be marked as dirty', function () {
    should.ok($oli.isDirty() === false);
  });
});

describe('after destroying a user', function () {
  var err;
  before(function (done) {
    $.destroy($oli).end(function (_err) {
      err = _err;
      done();
    });
  });

  it('should not return an error', function () {
    should.ok(!err);
  });

  it('user should be marked as destroyed', function () {
    should.ok($oli.isDestroyed());
  });

  it('user should be marked as probably new', function () {
    should.ok($oli.isProbablyNew());
  });

  it('user should be marked as not persisted', function () {
    should.ok(!$oli.isPersisted());
  });

  it('user should be marked as dirty', function () {
    should.ok($oli.isDirty());
  });

});
