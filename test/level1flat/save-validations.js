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
  before(function (done) {


  });

  it(k + ': should not validate', function () {
    should.ok($invalid_user.validates() === false);
    should.ok($invalid_user.errors.length > 0);
    console.log($invalid_user.errors);
  });

  it ('valid user: should validate', function () {
    should.ok($valid_user.validates());
    should.ok($valid_user.errors.length === 0);
  });

});
