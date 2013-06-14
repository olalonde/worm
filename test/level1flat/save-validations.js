var $ = require('../../'),
  common = require('./common'),
  should = require('should');

var User = $.model({
  name: 'User',
  attributes: [ 'id', 'name_first', 'name_last', 'email', 'password', 'location' ],
  id: [ 'id' ],
  adapters: [ $.adapter('test') ],
  validates: {
    presence_of: [ 'email', 'name_first', 'name_last', 'password' ],
    is_email: [ 'email' ],
  },
  validators: {
    presence_of: function (value, attribute) {
      this.error.name = 'presence_of';
      this.error.message = attribute + ' is not present.';
      //this.obj.first_name; $.wrap(this.obj).isNew();
      return (typeof value !== 'undefined');
    },
    is_email: function (value) {
      this.error.name = 'Invalid email';
      return (/[^\s]+@[^\s]+/).test(value);
    }
  }
});

var invalid_user = {
  name_first: 'Olivier$$$',
  name_last: 'Lalonde',
};

var valid_user = {
  name_first: 'Olivier',
  name_last: 'Lalonde',
  email: 'aaa@aaa.com',
  password: '12345'
};

var $valid_user = $.wrap(User, valid_user);
var $invalid_user = $.wrap(User, invalid_user);

// @TODO: this should be async eventually!

describe('saving invalid user', function () {
  var err;

  before(function (done) {
    common.pretest(done);
  });

  before(function (done) {
    $.save($invalid_user).end(function (_err) {
      err = _err;
      done();
    });
  });

  it('should return an error', function () {
    should.exist(err);
  });

  it ('error should contain 3 elements', function () {
    should.ok(err.length === 3);
  });

  it ('user should still be marked as dirty', function () {
    should.ok($invalid_user.isDirty());
  });

  it ('user should still be marked as new', function () {
    should.ok($invalid_user.isNew());
  });

  it ('User count should return 0', function (done) {
    $.count(User).end(function (err, count) {
      count.should.equal(0);
      done();
    });
  });

});

describe('saving a valid user', function () {
  var err;
  before(function (done) {
    $.save($valid_user).end(function (_err) {
      err = _err;
      done();
    });
  });

  it('should not return an error', function () {
    should.not.exist(err);
  });

  it ('User count should return 1', function (done) {
    $.count(User).end(function (err, count) {
      count.should.equal(1);
      done();
    });
  });

});
