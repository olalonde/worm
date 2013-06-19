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
    },
    {
      text: 'fun comment'
    },
    {
      text: 'fun comment'
    }
  ],
  author: {
    name: 'Oli'
  }
}, $post = $.wrap(Post, post);

describe('lazy loading one-to-many relationship', function () {
  var err;

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
    // @TODO: return null instead of empty array for get if no results?
    $.get(Post).where({ title: 'Some post...' }).end(function (_err, _post) {
      if (_err) console.error(_err);
      $.load($.wrap(_post), 'comments').end(function (_err, _post) {
        err = _err;
        res = _post;
        done();
      });
    });
  });

  it('should not return an error', function () {
    if (err) console.error(err);
    should.not.exist(err);
  });

  it('post should have correct title', function () {
    should.exist(post.title);
    res.title.should.equal('Some post...');
  });

  it('post should have comments property set', function () {
    should.exist(res.comments);
  });

  it('post should have 4 comments', function () {
    res.comments.length.should.equal(4);
  });

  it('post should have 4 comments with the correct attributes', function () {
    console.log(res.comments);
    // @TODO: for some reasons comments are returned in reverse order
    post.comments.forEach(function (comment, index) {
      res.comments[index].text.should.equal(comment.text);
    });
  });

});

