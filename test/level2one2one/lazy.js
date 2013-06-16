var async = require('async'),
  $ = require('../../'),
  should = require('should'),
  common = require('./common'),
  Person = common.Person,
  Passport = common.Passport;

describe('lazy loading a 1-to-1 relationship', function () {
  before(function (done) {
    common.pretest(done);
  });

  var oli, passport;

  before(function (done) {
    $.save($.wrap(Person, {
      name: 'oli',
      passport: {
        code: 123,
        country: 'Canada'
      }      
    })).end(function (err, res) {
      if (err) return done(err);
      done();
    });
  });

  before(function (done) {
    $.cache.clear(done);
  });

  before(function (done) {
    $.get(Person).where({ name: 'oli' }).end(function (err, person) {
      oli = person;
      done();
    });
  });

  it('should not return an error', function (done) {
    $oli = $.wrap(oli);
    $.load($oli, 'passport').end(function (err, _passport) {
      should.ok(!err);
      passport = _passport;
      done();
    });
  });

  it('person.passport should exist', function () {
    should.exist(oli.passport);
  });

  it('person.passport_id should equal person.passport_id', function () {
    oli.passport_id.should.equal(oli.passport.id);
  });
});

