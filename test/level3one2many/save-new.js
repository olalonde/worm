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
  ],
  author: {
    name: 'Oli'
  }
}, $post = $.wrap(Post, post);

describe('insert object with one-to-many relationship', function () {
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

  it('should not return an error', function () {
    if (err) console.error(err);
    should.not.exist(err);
  });

  it('post should be wrapped and not new', function () {
    should.exist(post._$instance);
    should.ok(!$.wrap(post).isNew());
  });
  
  it('post.comments should be wrapped and not new', function () {
    should.exist(post.comments._$instance);
    should.ok(!$.wrap(post.comments).isNew());
  });
  
  it('post.comments[0] should be wrapped and not new', function () {
    should.exist(post.comments[0]._$instance);
    should.ok(!$.wrap(post.comments[0]).isNew());
  });
  
  it('post.comments[1] should be wrapped and not new', function () {
    should.exist(post.comments[1]._$instance);
    should.ok(!$.wrap(post.comments[1]).isNew());
  });
  
  it('post.comments[0].post_id should equal post.id', function () {
    post.comments[0].post_id.should.equal(post.id);
  });
  
  it('post.comments[1].post_id should equal post.id', function () {
    post.comments[1].post_id.should.equal(post.id);
  });
  
  it('$.count(Comment) should return 2', function (done) {
    $.count(Comment).end(function (err, count) {
      count.should.equal(2);
      done();
    });
  });
  
  describe('after a fresh database load', function () {
    var post, err;

    before(function (done) {
      $.cache.clear(done);
    });

    before(function (done) {
      $.get(Post).where({ title: 'Some post...' }).include(['comments']).end(function (_err, _post) {
        err = _err;
        post = _post;
        done();
      });
    });
    
    it('should not return an error', function () {
      should.not.exist(err);
    });

    it('title should equal "Some post..."', function () {
      post.title.should.equal('Some post...');
    });

    it('post.comments.length should equal 2', function () {
      post.comments.length.should.equal(2);
    });

    it('post.comments[0].text should equal "first comment"', function () {
      post.comments[0].text.should.equal('first comment');
    });

    it('post.comments[1].text should equal "first comment"', function () {
      post.comments[1].text.should.equal('second comment');
    });

  });

});

