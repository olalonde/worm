var async = require('async'),
  $ = require('../../'),
  should = require('should'),
  common = require('./common'),
  User = common.User,
  Passport = common.Passport,
  oli = common.oli,
  derek = common.derek,
  casey = common.casey,
  passportoli = common.passportoli,
  passportderek = common.passportderek,
  passportcasey = common.passportcasey;

describe('wrapping a user with foreign relationships', function () {
  var user = {
    name: 'bob',
    passport: {
      code: 123,
      country: 'bob land'
    }
  }, $user;

  before(function (done) {
    common.pretest(done);
  });

  it('should not throw an error', function () {
    (function () {
      $user = $.wrap(User, user);
    }).should.not.throw();
  });

  it('$user.obj should equal user', function () {
    should.exist($user.obj);
    $user.obj.should.equal(user);
  });

  it('dirty attributes of user should not include passport', function () {
    $user.dirtyAttributes.should.not.include('passport');
  });

  it('user.passport should be wrapped', function () {
    should.exist(user.passport._$instance);
  });

  it('user.passport should be marked as new', function () {
    should.ok(user.passport._$instance.isNew());
  });

});
