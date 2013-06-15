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

describe('wrapping a person with a 1-to-1 relationship', function () {
  var person = {
    name: 'bob',
    passport: {
      code: 123,
      country: 'bob land'
    },
  }, $person;

  before(function (done) {
    common.pretest(done);
  });

  it('should not throw an error', function () {
    (function () {
      $person = $.wrap(Person, person);
    }).should.not.throw();
  });

  it('$person.obj should equal person', function () {
    should.exist($person.obj);
    $person.obj.should.equal(person);
  });

  it('dirty attributes of person should not include passport', function () {
    $person.dirtyAttributes.should.not.include('passport');
  });

  it('person.passport should be wrapped', function () {
    should.exist(person.passport._$instance);
  });

  it('person.passport._$instance should not equal person._$instance', function () {
    person.passport._$instance.should.not.equal(person._$instance);
  });

  it('person.passport should be marked as new', function () {
    should.ok(person.passport._$instance.isNew());
  });

});

describe('wrapping a person with nested 1-to-1 relationship', function () {
  var person = {
    name: 'bob',
    passport: {
      code: 123,
      country: 'bob land'
    },
    bestFriend: {
      name: 'Alice',
      passport: {
        code: 'wow'
      }
    },
  }, $person;

  it('should not throw an error', function () {
    (function () {
      $person = $.wrap(Person, person);
    }).should.not.throw();
  });

  it('person.bestFriend should be wrapped', function () {
    should.exist(person.bestFriend._$instance);
  });

  it('person.bestFriend.passport should be wrapped', function () {
    should.exist(person.bestFriend.passport._$instance);
  });

});

describe('wrapping a person with a self-referential 1-to-1 relationship', function () {
  var person = {
    name: 'Bob'
  }, $person;

  person.bestFriend = person;

  it('should not throw an error', function () {
    (function () {
      $person = $.wrap(Person, person);
    }).should.not.throw();
  });

  it('person.bestFriend should be wrapped', function () {
    should.exist(person.bestFriend._$instance);
  });

  it('person.bestFriend should equal person', function () {
    person.bestFriend.should.equal(person);
  });

  it('person.bestFriend._$instance should equal person._$instance', function () {
    person._$instance.should.equal(person.bestFriend._$instance);
  });

});

describe('wrapping a person with a 1-to-1 relationship that was already wrapped', function () {
  var alice = {
    name: 'Alice'
  };

  var $alice = $.wrap(Person, alice);

  var person = {
    name: 'Bob',
    bestFriend: alice
  }, $person;

  it('should not throw an error', function () {
    (function () {
      $person = $.wrap(Person, person);
    }).should.not.throw();
  });

  it('person.bestFriend should be wrapped', function () {
    should.exist(person.bestFriend._$instance);
  });

  it('person.bestFriend should equal alice', function () {
    person.bestFriend.should.equal(alice);
  });

});
