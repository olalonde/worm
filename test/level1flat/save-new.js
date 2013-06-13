var $ = require('../../'),
  should = require('should');

$.adapter($.adapters.memory());

var User = $.model({
  name: 'User',
  attributes: [ 'id', 'name_first', 'name_last', 'email', 'location' ],
  adapters: [ $.adapters.memory ]
});

// or
User = $.models.User;

var oli = {
  name_first: 'Olivier',
  name_last: 'Lalonde',
  email: 'olalonde@gmail.com',
  notPersistent: 'dont save me im not in attribute list'
};

$oli = $.wrap(User, oli);

describe('saving a new user', function () {
  var err, user;

  before(function (done) {
    $.save($oli).end(function (_err, _user) {
      err = _err;
      user = _user;
      done();
    });
  });

  it('should not return an error', function () {
    should.ok(!err);
  });

  it('user should be an object', function () {
    should.exist(user);
    user.should.be.a('object');
  });

  it('should set the properties on user', function () {
    user.should.have.property('name_first');
    user.should.have.property('name_last');
    user.should.have.property('email');
    user.should.have.property('notPersistent');
  });

  it('the user returned should be a reference to oli', function () {
    user.should.equal(oli);
  });

});
