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

describe('saving person\'s passport using passport_id attribute', function () {
  before(function (done) {
    common.pretest(done);
  });

  before(function (done) {
    async.series([
      $.save($.wrap(Passport, passportoli)).cb(),
      $.save($.wrap(Passport, passportderek)).cb(),
      $.save($.wrap(Passport, passportcasey)).cb(),
    ], function (err, res) {
      if (err) return done(err);
      oli.passport_id = passportoli.id;
      derek.passport_id = passportderek.id;
      casey.passport_id = passportcasey.id;
      done();
    });
  });

  before(function (done) {
    async.series([
      $.save($.wrap(Person, oli)).cb(),
      $.save($.wrap(Person, derek)).cb(),
      $.save($.wrap(Person, casey)).cb(),
    ], function (err, res) {
      if (err) return done(err);
      done();
    });
  });

  it('the passport_id of the person objects should be set', function () {
    [ oli, derek, casey ].forEach(function (person) {
      should.exist(person.passport_id);
    });
  });

  describe('removing passport_id on a person', function () {
    before(function (done) {
      oli.passport_id = null;
      $.save(oli).end(done);
    });

    it('the attribute_id should not be set', function () {
      should.not.exist(oli.passport_id);
    });

  });

});

describe('saving a new person with embed passport object', function () {

  // worm should recursively save relationships which
  // are new/not wrapped and of course save those relationships
  var person = {
    name: 'bob',
    passport: {
      code: 123,
      country: 'bob land'
    }
  }, $person = $.wrap(Person, person);

  before(function (done) {
    $.save($person).end(done);
  });

  it('person should be saved', function () {
    should.ok(!$person.isDirty());
    should.ok(!$person.isNew());
    should.ok($person.isPersisted());
  });

  it('person.passport should be saved', function () {
    var $passport = $.wrap(person.passport);
    should.ok(!$passport.isDirty());
    should.ok(!$passport.isNew());
    should.ok($passport.isPersisted());
  });

  it('person.passport_id should exist', function () {
    should.exist(person.passport_id);
  });

  it('person.passport_id should equal person.passport.id', function () {
    person.passport_id.should.equal(person.passport.id);
  });

});
