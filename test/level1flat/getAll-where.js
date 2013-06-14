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

var ron = {
  name_first: 'Ron',
  name_last: 'Paul',
  email: 'ron@paul.com',
  notPersistent: 'dont save me im not in attribute list'
};

var rand = {
  name_first: 'Rand',
  name_last: 'Paul',
  email: 'rand@paul.com'
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

var $ron = $.wrap(User, ron);
var $rand = $.wrap(User, rand);
var $steve = $.wrap(User, steve);
var $bill = $.wrap(User, bill);

describe('$.getAll(User).where()', function () {
  var err, users;

  before(function (done) {
    common.pretest(done);
  });

  before(function (done) {
    async.parallel([
      $.save($ron).cb(),
      $.save($rand).cb(),
      $.save($steve).cb(),
      $.save($bill).cb()
    ], function (err, res) {
      done();
    });
  });

  describe('{ name_last: "Paul" }', function () {
    before(function (done) {
      $.getAll(User).where({ name_last: 'Paul' }).end(function (_err, _users) {
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

    it('loaded users last name should be Paul', function () {
      users.forEach(function (user) {
        user.name_last.should.equal('Paul');
      });
    });
  });

  describe('name_first: Steve or ' +
           '(name_last: Paul and ' +
           'name_first != Rand and ' +
           'email != rand@paul.com)', function () {

    var err, users;

    before(function (done) {

      $.getAll(User).where(function (_) {
          return _('name_first')
          .eql('Steve')
          .or(
            _('name_last').notEql('Jobs')
            .and(_('name_last').eql('Paul'))
            .and(_('email').notEql('rand@paul.com'))
          );
        })
        .end(function (_err, _users) {
          err = _err;
          users = _users;
          done();
        });

      // @todo: Support this syntax?
      //$.getAll(User).where(function (name_first, name_last) {
          //return name_first
          //.eql('Steve')
          //.or(
            //name_last.eql('Jobs')
            //.and(_('name_first').notEql('Rand'))
            //.and(_('email').notEql('rand@paul.com'))
          //);
        //})
        //.end(function (_err, _users) {
          //err = _err;
          //users = _users;
          //done();
        //});
    });

    it('should not return an error', function () {
      if (err) console.error(err);
      should.ok(!err);
    });

    it('loaded users should have length 2', function () {
      users.length.should.be.equal(2);
    });

  });
});
