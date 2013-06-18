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

  it('post should have 4 comments', function () {
    res.comments.length.should.equal(4);
  });

  it('post should have 4 comments with the correct attributes', function () {
    post.comments.forEach(function (comment, index) {
      res.comments[index].text.should.equal(comment.text);
    });
  });

});

describe('eager loading one-to-many relationship + one-to-one relationship', function () {
  var err, res;

  before(function (done) {
    $.cache.clear(done);
  });

  before(function (done) {
    $.get(Post)
      .where({ title: 'Some post...' })
      .include(['comments', 'author'])
      .end(function (_err, _res) {
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

  it('post should have 4 comments', function () {
    res.comments.length.should.equal(4);
  });

  it('post should have 4 comments with the correct attributes', function () {
    post.comments.forEach(function (comment, index) {
      res.comments[index].text.should.equal(comment.text);
    });
  });

  it('post should have an author', function () {
    should.exist(post.author);
  });

  it('author name should be correct', function () {
    post.author.name.should.equal('Oli');
  });

});

describe.skip('eager loading one-to-many relationship with where', function () {
  var err, res;

  before(function (done) {
    $.cache.clear(done);
  });

  before(function (done) {
    $.get(Post).where({ comments: { text: 'fun comment' } }).include(['comments']).end(function (_err, _res) {
      err = _err;
      res = _res;
      done();
    });
  });

  // @TODO: { 'comments.text': '.....' } syntax
  it.skip('should be possible to use "comments.text": "fun comment" syntax', function () {});

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
      res.comments[index].text.should.equal('fun comment');
    });
  });

});
