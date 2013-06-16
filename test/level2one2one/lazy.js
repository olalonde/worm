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

  var oli;

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

  it('should be able to fetch the user', function () {
    oli.name.should.equal('oli');
  });
});

