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
  email: 'milton@friedman.com'
};

var steve = {
  name_first: 'Steve',
  name_last: 'Jobs',
  email: 'steve@apple.com'
};

var bill = {
  name_first: 'Bill',
  name_last: 'Gates',
  email: 'bill@microsoft.com'
};

var $oli = $.wrap(User, oli);
var $milton = $.wrap(User, milton);
var $steve = $.wrap(User, steve);
var $bill = $.wrap(User, bill);

describe('$.getAll().limit(2)', function () {
  var err, users;

  before(function (done) {
    common.pretest(done);
  });

  before(function (done) {
    async.parallel([
      $.save($oli).cb(),
      $.save($milton).cb(),
      $.save($steve).cb(),
      $.save($bill).cb()
    ], function (err, res) {
      done();
    });
  });

  before(function (done) {
    $.getAll(User).limit(2).end(function (_err, _users) {
      err = _err;
      users = _users;
      done();
    });
  });

  it('should not return an error', function () {
    should.ok(!err);
  });

  it('loaded users should have length 2', function () {
    users.length.should.be.equal(2);
  });

});
