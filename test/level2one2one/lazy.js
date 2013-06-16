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

  var oli, $oli, passport, person = {
    name: 'oli',
    passport: {
      code: 123,
      country: 'Canada'
    }
  };

  person.bestFriend = person;

  before(function (done) {
    $.save($.wrap(Person, person)).end(function (err, res) {
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

  describe('lazy loading self-referential 1-to-1 relation ship', function () {
    it('should not return an error', function (done) {
      $.load($oli, 'bestFriend').end(function (err) {
        should.ok(!err);
        done();
      });
    });

    it('person.bestFriend should exist', function () {
      should.exist(oli.bestFriend);
    });

    it('person.bestfriend_id should equal person.bestFriend.id', function () {
      oli.bestfriend_id.should.equal(oli.bestFriend.id);
    });

    it('person.bestfriend should equal person', function () {
      oli.bestFriend.should.equal(oli);
    });

  });
});

