var async = require('async'),
  $ = require('../../'),
  should = require('should'),
  common = require('./common'),
  Company = common.Company,
  Role = common.Role,
  Employee = common.Employee;

describe.skip('lazy loading many-to-many relationship', function () {
  var err;

  before(function (done) {
    common.pretest(done);
  });

  //before(function (done) {
    //$.save().end(function (_err) {
      //err = _err;
      //done();
    //});
  //});

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

  //it('should not return an error', function () {
    //if (err) console.error(err);
    //should.not.exist(err);
  //});


});

