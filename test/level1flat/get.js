var $ = require('../../'),
  common = require('./common'),
  should = require('should');

var User = $.model({
  name: 'User',
  attributes: [ 'id', 'name_first', 'name_last', 'email', 'location' ],
  id: [ 'id' ],
  adapters: [ $.adapter('test') ]
});

var oli = {
  name_first: 'Olivier',
  name_last: 'Lalonde',
  email: 'olalonde@gmail.com',
  notPersistent: 'dont save me im not in attribute list'
};

var $oli = $.wrap(User, oli);

describe('$.get', function () {
  var err, saved_user, loaded_user;

  before(function (done) {
    common.pretest(done);
  });

  before(function (done) {
    $.save($oli).end(function (_err, _user) {
      err = _err;
      saved_user = _user;
      //@TODO: clear cache.. we dont want to test cache right now
      // worm.cache.clear();
      $.get(User).id(1).end(function (_err, _user) {
        err = err || _err;
        loaded_user = _user;
      });
      done();
    });
  });

  it('should not return an error', function () {
    should.ok(!err);
  });

  it('loaded user should be an object', function () {
    should.exist(loaded_user);
  });

  it('loaded user should have properties set', function () {
    loaded_user.should.have.property('name_first');
    loaded_user.should.have.property('name_last');
    loaded_user.should.have.property('email');
    loaded_user.should.have.property('notPersistent');
  });

  it('loaded user properties should have correct values', function () {
    loaded_user.name_first.should.equal('Olivier');
    loaded_user.name_last.should.equal('Lalonde');
    loaded_user.email.should.equal('olalonde@gmail.com');
  });

  it('loaded user should not be marked as dirty', function () {
    should.ok(loaded_user._$instance.isDirty() === false);
  });

  it('loaded user should not be marked as new', function () {
    should.ok(loaded_user._$instance.isNew() === false);
  });

});
