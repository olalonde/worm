var async = require('async'),
  $ = require('../../'),
  should = require('should'),
  common = require('./common'),
  Company = common.Company,
  Role = common.Role,
  Employee = common.Employee;

// companies
var vox = { name: 'Vox' },
  olico = { name: 'Oli Co.' };

// employees
var oli = { name: 'Oli' },
  casey = { name: 'Casey' },
  arnold = { name: 'Arnold' };

var companies = [ vox, olico ];
var employees = [ oli, casey, arnold ];

var roles = [
  { type: 'ceo', company: vox, employee: arnold },
  { type: 'developer', company: vox, employee: oli },
  { type: 'developer', company: vox, employee: casey },
  { type: 'ceo', company: olico, employee: oli }
];

describe('save-new with many-to-many relationships', function () {
  var err, vox, res;

  before(function (done) {
    common.pretest(done);
  });

  before(function (done) {
    async.series([
      $.save($.wrap(Company, companies)).cb(),
      $.save($.wrap(Employee, employees)).cb(),
      $.save($.wrap(Role, roles)).cb()
    ], function (_err) {
      err = _err;
      done();
    });
  });

  before(function (done) {
    $.cache.clear(done);
  });

  before(function (done) {
    $.get(Company).where({ name: 'Vox' }).end(function (_err, _vox) {
      if (_err) console.error(_err);
      vox = _vox;
      $.load(vox, 'roles').end(function (_err, _roles) {
      //@TODO $.load(vox, 'roles').include([ 'employee' ]).end(function (_err, _roles) {
        res = _roles;
        done();
      });
    });
  });

  it('should not return an error', function () {
    if (err) console.error(err);
    should.not.exist(err);
  });

  it('res should equal vox.roles', function () {
    res.should.equal(vox.roles);
  });

  it('vox.roles should be an array', function () {
    should.ok(Array.isArray(vox.roles));
  });

  it('vox.roles should have length 3', function () {
    vox.roles.length.should.equal(3);
  });

});

