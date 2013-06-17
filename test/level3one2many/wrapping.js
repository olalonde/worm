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
}, $post;

describe('wrapping object with one-to-many relationship', function () {
  before(function (done) {
    common.pretest(done);
  });

  before(function () {
    $post = $.wrap(Post, post);
  });

  it('post should be wrapped', function () {
    should.exist(post._$instance);
  });

  it('post.comments should be wrapped', function () {
    should.exist(post.comments._$instance);
    post.comments._$instance.model.name.should.equal('Comment');
  });

  it('post.comments[0] should be wrapped', function () {
    should.exist(post.comments[0]._$instance);
    post.comments[0]._$instance.model.name.should.equal('Comment');
  });

  it('post.comments[1] should be wrapped', function () {
    should.exist(post.comments[1]._$instance);
    post.comments[1]._$instance.model.name.should.equal('Comment');
  });

});

