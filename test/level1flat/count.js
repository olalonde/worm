var $ = require('../../'),
  common = require('./common'),
  should = require('should');

var User, oli, milton, $oli, $milton;

describe('count users', function () {
  var err, count;

  before(function (done) {
    common.pretest(done);
  });
  before(function () {

    User = $.model({
      name: 'User',
      attributes: [ 'id', 'name_first' ],
      id: [ 'id' ],
      adapters: [ $.adapter('test1') ]
    });

    oli = {
      name_first: 'Olivier',
    };

    milton = {
      name_first: 'Milton',
    };

    $oli = $.wrap(User, oli);
    $milton = $.wrap(User, milton);
  });

  // Save 2 users
  before(function (done) {
    $.save($oli).end(function () {
      $.save($milton).end(done);
    });
  });

  before(function (done) {
    $.count(User).end(function (_err, _count) {
      if (_err) console.error(_err);
      err = _err;
      count = _count;
      done();
    });
  });

  it('should not return an error', function () {
    should.ok(!err);
  });

  it('should return 2', function () {
    should.ok(count === 2);
  });

});
