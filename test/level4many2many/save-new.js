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
  var err;

  before(function (done) {
    common.pretest(done);
  });

  before(function (done) {
    $.save($.wrap(Company, companies)).end(function (_err) {
      err = err || _err;
      done();
    });
  });

  before(function (done) {
    $.save($.wrap(Employee, employees)).end(function (_err) {
      err = err || _err;
      done();
    });
  });

  before(function (done) {
    $.save($.wrap(Role, roles)).end(function (_err) {
      err = err || _err;
      done();
    });
  });

  //before(function (done) {
    //$.cache.clear(done);
  //});

  //before(function (done) {
    //// @TODO: return null instead of empty array for get if no results?
    //$.get(Post).where({ title: 'Some post...' }).end(function (_err, _post) {
      //if (_err) console.error(_err);
      //$.load($.wrap(_post), 'comments').end(function (_err, _post) {
        //err = _err;
        //res = _post;
        //done();
      //});
    //});
  //});

  it('should not return an error', function () {
    if (err) console.error(err);
    should.not.exist(err);
  });


});

