var async = require('async'),
  $ = require('../../'),
  should = require('should'),
  common = require('./common'),
  Post = common.Post,
  Comment = common.Comment;

var post = {
  title: 'Some post...',
  comments: [
    {
      text: 'first comment'
    },
    {
      text: 'second comment'
    }
  ]
}, $post = $.wrap(Post, post);

describe('eager loading one-to-many relationship', function () {
  var err, $post, res;

  before(function (done) {
    common.pretest(done);
  });

  before(function (done) {
    $.save(post).end(function (_err) {
      err = _err;
      done();
    });
  });

  before(function (done) {
    $.cache.clear(done);
  });

  before(function (done) {
    $.get(Post).where({ title: 'Some post...' }).include(['comments']).end(function (_err, _res) {
      err = _err;
      res = _res;
      done();
    });
  });

  /**
   * @TODO: fresh reload from db and check if changes are reflected
   */

  it('should not return an error', function () {
    if (err) console.error(err);
    should.not.exist(err);
  });

  it('post should have correct title', function () {
    should.exist(res.title);
    res.title.should.equal('Some post...');
  });

  it('post should have comments property set', function () {
    should.exist(res.comments);
  });

  it('post should have 2 comments', function () {
    res.comments.length.should.equal(2);
  });

  it('post should have 2 comments with the correct attributes', function () {
    post.comments.forEach(function (comment, index) {
      res.comments[index].text.should.equal(comment.text);
    });
  });

});

