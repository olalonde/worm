var async = require('async'),
  $ = require('../../'),
  should = require('should'),
  common = require('./common'),
  Person = common.Person,
  Passport = common.Passport;

describe('eager loading 1-to-1 relationship', function () {
  before(function (done) {
    common.pretest(done);
  });

  var oli, $oli, passport, person = {
    name: 'oli',
    passport: {
      code: 123,
      country: 'Canada'
    },
    bestFriend: {
      name: 'Alice',
      passport: {
        country: 'USA'
      }
    }
  };

  // save person
  before(function (done) {
    $.save($.wrap(Person, person)).end(function (err, res) {
      if (err) return done(err);
      done();
    });
  });

  // clear cache
  before(function (done) {
    $.cache.clear(done);
  });

  it('should not return an error', function (done) {
    $.get(Person).where({ name: 'oli' }).include(['passport', 'bestFriend']).end(function (err, person) {
      if (err) console.error(err);
      should.ok(!err);
      oli = person;
      done();
    });
  });

  // todo: move this test somewhere else (at level1flat/getall?)
  it('person should be wrapped', function () {
    should.exist(person._$instance);
  });

  it('person.passport should exist', function () {
    should.exist(oli.passport);
  });

  it('person.bestFriend should exist', function () {
    should.exist(oli.bestFriend);
  });

  it('person.passport_id should equal person.passport_id', function () {
    oli.passport_id.should.equal(oli.passport.id);
  });

  it('person.bestfriend_id should equal person.bestFriend.id', function () {
    oli.bestfriend_id.should.equal(oli.bestFriend.id);
  });

  describe('self referential include', function () {
    var bob;
    before(function (done) {
      bob = {
        name: 'bob',
        passport: {
          country: 'bobland'
        }
      };
      bob.bestFriend = bob;
      $.save($.wrap(Person, bob)).end(done);
    });

    before(function (done) {
      $.cache.clear(done);
    });

    before(function (done) {
      $.get(Person).where({ name: 'bob' }).include(['passport', 'bestFriend']).end(function (err, person) {
        if (err) console.error(err);
        should.ok(!err);
        bob = person;
        done();
      });
    });

    it('person.bestfriend should equal person', function () {
      bob.bestFriend.should.equal(bob);
    });
  });

  describe.skip('nested include', function () {

    before(function (done) {
      $.cache.clear(done);
    });

    it('should not return an error', function (done) {
      $.get(Person).where({ name: 'oli' }).include(['bestFriend', 'bestFriend.passport']).end(function (err, person) {
        oli = person;
        done();
      });
    });
  });
});

