var async = require('async'),
  $ = require('../../'),
  should = require('should'),
  common = require('./common'),
  Person = common.Person,
  Passport = common.Passport,
  oli = common.oli,
  derek = common.derek,
  casey = common.casey,
  passportoli = common.passportoli,
  passportderek = common.passportderek,
  passportcasey = common.passportcasey;

describe('adding a non-existing passport to an existing person', function () {
  before(function (done) {
    common.pretest(done);
  });

  var $oli = $.wrap(Person, oli), $passport;
  before(function (done) {
    $.save($oli).end(function (err, res) {
      if (err) return done(err);
      oli.passport = passportoli;
      $.save($oli).end(function (err, res) {
        if (err) return done(err);
        done();
      });
    });
  });

  it('the passport should be wrapped', function () {
    (function () {
      $passport = $.wrap(oli.passport);
    }).should.not.throw();
  });

  it('the passport should be marked as persisted', function () {
    should.ok($passport.persisted);
  });

  it('the passport should not be marked as new', function () {
    should.ok(!$passport.isNew());
  });

  it('the passport_id of the person objects should exist', function () {
    should.exist(oli.passport_id);
  });

  it('the passport_id of the person objects should equal person.passport.id', function () {
    oli.passport_id.should.equal(oli.passport.id);
  });

});

