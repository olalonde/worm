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
    post.title = 'New title';
    post.comments[0].text = 'modified comment';

    $.save(post).end(function (_err) {
      err = err || _err;
      done();
    });
  });

  before(function (done) {
    $.cache.clear(done);
  });

  before(function (done) {
    $.getAll(Post)
      .where({ title: 'New title' })
      .include([ 'comments' ])
      .end(function (_err, _posts) {
        err = err || _err;
        res = _posts[0];
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

  it('title should be updated', function () {
    res.title.should.equal('New title');
  });

  it.skip('comments[0].text should be updated', function () {
    res.comments[0].text.should.equal('modified comment');
  });

});

