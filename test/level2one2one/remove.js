var async = require('async'),
  $ = require('../../'),
  should = require('should'),
  common = require('./common'),
  Person = common.Person,
  Passport = common.Passport;

/**
 * @TODO: alternative way to remove 1-to-1 relationships:
 * simply set person.passport = null;
 *
 * We can delete relationships that were set to null but ignore
 * the relationships that are not set on ther user;
 *
 * For example, if I want to delete passport I could do
 *
 * var $person = $.wrap(Person, { 
 *  id: 1,
 *  passport: null
 *  });
 *
 * This wont remove bestFriend but it will remove passport?
 * Also, it won't delete attributes since they are not set on the
 * object. This is tricky as we have to be careful to handle null
 * differently from undefined.
 *
 * $.save($person).end();
 *
 * @TODO:
 * use $.destroy(Person, 'path') syntax instead?
 */
describe('removing 1-to-1 relationship', function () {
  before(function (done) {
    common.pretest(done);
  });

  var oli = {
    name: 'oli',
    passport: {
      code: 123,
      country: 'Canada'
    }
  }, $oli = $.wrap(Person, oli);

  before(function (done) {
    $.save($oli).end(function (err, res) {
      if (err) return done(err);
      done();
    });
  });

  describe('of a loaded person', function () {
    var err;
    before(function (done) {
      $.remove($oli, 'passport').end(function (_err) {
        err = _err;
        done();
      });
    });

    it('should not return an error', function () {
      if (err) console.error(err);
      should.ok(!err);
    });

    it('person.passport_id should not exist', function () {
      should.not.exist(oli.passport_id);
    });

    it('person.passport should not exist', function () {
      should.not.exist(oli.passport);
    });

    describe('after a force reload from database', function () {
      var person;

      // forcing reload from db
      before(function (done) {
        $.cache.clear(done);
      });

      before(function (done) {
        $.get(Person).where({ name: 'oli' }).end(function (err, _person) {
          person = _person;  
          done();
        });
      });

      it('person.passport_id should not exist', function () {
        should.not.exist(person.passport_id);
      });

    });

    // maybe if it's a belongsTo relationship, remove the passport
    // object from the database as well?
    it.skip('there should be no passport in the database', function () {
      $.count(Passport).end(function (err, count) {
        count.should.equal(0);
      });
    });
  });
});
