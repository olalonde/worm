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

describe('update object with one-to-many relationship', function () {
  var err, $post;

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
    post.title = 'New title';
    post.comments[0].text = 'modified comment';

    $.save(post).end(function (_err) {
      err = _err;
      done();
    });
  });

  /**
   * @TODO: fresh reload from db and check if changes are reflected
   */

  it('should not return an error', function () {
    should.not.exist(err);
  });

});

