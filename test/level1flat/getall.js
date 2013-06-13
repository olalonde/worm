var $ = require('../../'),
  should = require('should');

var memory = $.adapter($.adapters.memory());

var User = $.model({
  name: 'User',
  attributes: [ 'id', 'name_first', 'name_last', 'email', 'location' ],
  id: [ 'id' ],
  adapters: [ memory ]
});

var oli = {
  name_first: 'Olivier',
  name_last: 'Lalonde',
  email: 'olalonde@gmail.com',
  notPersistent: 'dont save me im not in attribute list'
};

var bill = {
  name_first: 'Bill',
  name_last: 'Gates',
  email: 'bill@microsoft.com'
};

var $oli = $.wrap(User, oli);
var $bill = $.wrap(User, bill);

describe('$.getAll', function () {
  var err, saved_oli, saved_bill, users;

  before(function (done) {
    $.save($oli).end(function (_err, _user) {
      err = _err;
      saved_oli = _user;
      $.save($bill).end(function (_err, _user) {
        saved_bill = _user;

        $.getAll(User).end(function (_err, _users) {
          err = err || _err;
          users = _users;
          done();
        });
      });
    });
  });

  it('should not return an error', function () {
    should.ok(!err);
  });

  it('loaded users should be an array', function () {
    should.exist(users);
    users.should.be.an.instanceOf(Array);
  });

  it('loaded users should have length 2', function () {
    users.length.should.be.equal(2);
  });

  it('loaded users should have user properties', function () {
    users.forEach(function (user) {
      user.should.have.property('name_first');
      user.should.have.property('name_last');
      user.should.have.property('email');
    });
  });

  it('loaded users should "weak equal" oli and bill', function () {
    var _oli, _bill;
    if (users[0].name_first === 'Bill') {
      _bill = users[0];
      _oli = users[1];
    }
    else {
      _oli = users[0];
      _bill = users[1];
    }

    ['name_first', 'name_last', 'email'].forEach(function (attr) {
      _oli[attr].should.equal(oli[attr]);
      _bill[attr].should.equal(bill[attr]);
    });
  });

  it('loaded users should deep equal oli and bill', function () {
    if (users[0] !== oli) {
      users[0].should.equal(bill);
      users[1].should.equal(oli);
    }
    else {
      users[0].should.equal(oli);
      users[1].should.equal(bill);
    }
  });

  //it('loaded user should have properties set', function () {
    //loaded_user.should.have.property('name_first');
    //loaded_user.should.have.property('name_last');
    //loaded_user.should.have.property('email');
    //loaded_user.should.not.have.property('notPersistent');
  //});

  //it('loaded user properties should have correct values', function () {
    //loaded_user.name_first.should.equal('Olivier');
    //loaded_user.name_last.should.equal('Lalonde');
    //loaded_user.email.should.equal('olalonde@gmail.com');
  //});

});
