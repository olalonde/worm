var $ = require('../../'),
  common = require('./common'),
  should = require('should');

var User = $.model({
  name: 'User',
  attributes: [ 'id', 'name_first', 'name_last', 'email', 'location' ],
  adapters: [ $.adapter('test') ]
});

// or
User = $.models.User;

var oli = {
  name_first: 'Olivier',
  name_last: 'Lalonde',
  email: 'olalonde@gmail.com',
  notPersistent: 'dont save me im not in attribute list'
};

var $oli = $.wrap(User, oli);

describe('updating a user', function () {

  before(function (done) {
    common.pretest(done);
  });

  before(function (done) {
    $.save($oli).end(done);
  });

  before(function () {
    oli.name_first = 'Milton';
    oli.name_last = 'Friedman';
  });

  describe('before saving', function () {

    it('isDirty should return true', function () {
      should.ok($oli.isDirty());
    });

  });

  describe('after saving', function () {
    var err; 

    before(function (done) {
      $.save($oli).end(function (_err, res) {
        err = _err;                  
        done();
      });
    });

    it('should not return an error', function () {
      should.ok(!err);
    });

    it('isDirty should return false', function () {
      should.ok(!$oli.isDirty());
    });

    it('user first name should have changed', function () {
      oli.name_first.should.equal('Milton');
      oli.name_last.should.equal('Friedman');
    });

    it('there should be only one object in User', function (done) {
      $.count(User).end(function (err, count) {
        should.not.exist(err);
        should.exist(count);
        count.should.equal(1);
        done();
      });
    });
  });

});


