var $ = require('../../'),
  _ = require('underscore'),
  common = require('./common'),
  should = require('should');

// @TODO: this should be async eventually!

var User, invalid_users, $valid_user, valid_user;
describe('testing validations for', function () {
  before(function () {

    User = $.model({
      name: 'User',
      attributes: [ 'id', 'name_first', 'name_last', 'email', 'password', 'location' ],
      id: [ 'id' ],
      adapters: [ $.adapter('test') ],
      validates: {
        presence_of: [ 'email', 'name_first', 'name_last', 'password' ],
        is_email: [ 'email' ],
        // first array element is passed to validator if its not an
        // attribute
        regex: {
          args: [ /^[A-Za-z]+$/i ],
          attributes: [ 'name_first' ]
        },
        min: {
          args: [ 4 ],
          attributes: [ 'name_first' ]
        }
      },
      // @TODO support async validators
      // maybe using var done = this.done(); trick from grunt?
      // or check if validator has arity 3?
      validators: {
        // this is bound to a custom object
        // where you can set errors, access the obj, etc.
        // this.error.name defaults to the property the validator is set on?
        // @TODO: write built in validators
        presence_of: function (value, attribute) {
          this.error.name = 'presence_of';
          this.error.message = attribute + ' is not present.';
          //this.obj.first_name; $.wrap(this.obj).isNew();
          return (typeof value !== 'undefined');
        },
        regex: function (regex) {
          return function (value) {
            return regex.test(value);
          };
        },
        min: function (length) {
          return function (value) {
            return (value.length >= length);
          };
        },
        is_email: function (value) {
          this.error.name = 'Invalid email';
          return (/[^\s]+@[^\s]+/).test(value);
        }
      }
      // @TODO: hooks:  (hooks can block an action save/get/validate/etc.)
      // example hooks: before_save, after_save etc.
      // @TODO: have some builtin hooks? validation could actually be done
      // by a built in hook? hooks could register themselves and form a
      // stack? there could be a built in hook that checks the
      // schema.transform property and use it to transform some values
      // before validation / save?
      //
      // @TODO: events (events are not defined directly on the model, rather
      // you can listen for events this way: $obj.on('save', function () {})
      // events are asynchronous and cannot block an action...
    });

    invalid_users = {
      no_email_no_password: {
        name_first: 'Olivier',
        name_last: 'Lalonde',
      },
      no_email: {
        name_first: 'Olivier',
        name_last: 'Lalonde',
        password: '12345'
      },
      invalid_first_name: {
        name_first: 'Olivier$$$',
        name_last: 'Lalonde',
        email: 'aaa@aaa.com',
        password: '12345'
      },
      invalid_first_name_and_email: {
        name_first: 'Olivier$$$',
        name_last: 'Lalonde',
        email: 'aaaaaa.com',
        password: '12345'
      }
    };
    valid_user = {
      name_first: 'Olivier',
      name_last: 'Lalonde',
      email: 'aaa@aaa.com',
      password: '12345'
    };

    $valid_user = $.wrap(User, valid_user);

  });

  _.each(invalid_users, function (invalid_user, k) {
    var $invalid_user = $.wrap(User, invalid_user);

    it(k + ': should not validate', function () {
      should.ok($invalid_user.validates() === false);
      should.ok($invalid_user.errors.length > 0);
      console.log($invalid_user.errors);
    });
  });

  it ('valid user: should validate', function () {
    should.ok($valid_user.validates());
    should.ok($valid_user.errors.length === 0);
  });
});
