var $ = require('../../'),
  common = require('./common'),
  should = require('should');

var User, users, $users;

User = $.model({
  name: 'User',
  attributes: [ 'id', 'name_first', 'name_last' ],
  id: [ 'id' ],
  adapters: [ $.adapter('test1') ]
});

users = [
  { name_first: 'Olivier' },
  { name_first: 'Milton', name_last: 'Friedman' },
  { name_first: 'Alice', name_last: 'Friedman' },
  { name_first: 'Bob', name_last: 'Friedman' },
  { name_first: 'Milton' }
];

$users = $.wrap(User, users);

describe('count users', function () {
  var err, total_count, where_count;

  before(function (done) {
    common.pretest(done);
  });

  // Save users
  before(function (done) {
    $.save($users).end(function () {
      done();
    });
  });

  before(function (done) {
    $.count(User).end(function (_err, _count) {
      if (_err) console.error(_err);
      err = _err;
      total_count = _count;
      done();
    });
  });

  before(function (done) {
    $.count(User)
      .where({ name_last: 'Friedman' })
      .end(function (_err, _count) {
        if (_err) console.error(_err);
        err = err || _err;
        where_count = _count;
        done();
      });
  });

  it('should not return an error', function () {
    if (err) console.log(err);
    should.ok(!err);
  });

  it('total count should return 5', function () {
    should.ok(total_count === 5);
  });

  it('where count should return 3', function () {
    should.ok(where_count === 3);
  });

});
