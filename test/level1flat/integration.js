var $ = require('../../'),
  async = require('async'),
  common = require('./common'),
  should = require('should');

var User = $.model({
  name: 'User',
  attributes: [ 'id', 'name_first', 'name_last', 'email', 'location' ],
  id: [ 'id' ],
  adapters: [ $.adapter('test') ]
});

var oli = {
  name_first: 'Olivier',
  name_last: 'Lalonde',
  email: 'olalonde@gmail.com',
  notPersistent: 'dont save me im not in attribute list'
};

var milton = {
  name_first: 'Milton',
  name_last: 'Friedman',
  email: 'bill@microsoft.com'
};

var bill = {
  name_first: 'Bill',
  name_last: 'Gates',
  email: 'bill@microsoft.com'
};

var $oli = $.wrap(User, oli);
var $milton = $.wrap(User, milton);
var $bill = $.wrap(User, bill);

describe('integration testing', function () {
  var err, results;

  before(function (done) {
    common.pretest(done);
  });

  describe('saving users', function () {
    before(function (done) {
      async.parallel([
        $.save($oli).cb(),
        $.save($milton).cb(),
        $.save($bill).cb()
      ],
      function (_err, _results) {
        err = _err;
        results = _results;
        done();
      });
    });

    it('should not return error', function () {
      console.log(err);
      should.ok(!err);
    });

    it('user collection should have 3 objects', function (done) {
      $.count(User).end(function (err, count) {
        should.not.exist(err);
        count.should.equal(3);
        done();
      });
    });

  });
  /**
   * @TODO: continue the integration test! more funky stuff to break the
   * system
   */
});
