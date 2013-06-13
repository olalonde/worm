$.model()


// locations
var beijing = $.Location({
  city: 'Beijing',
  country: 'China'
});
var montreal = $.Location({
  city: 'Montreal',
  country: 'Canada'
});

// users
var jo = $.User({
  id: 1,
  name: {
    first: 'Jo',
    last: 'Bouchard'
  }
  email: '' //empty: oops, validation fails
});

var oli = $.User({
  name: { // in SQL should save as name_first and name_last, in mongodb as embed object
    first: 'Olivier',
    last: 'Lalonde'
  },
  password: 'clear password', // should save as hashed password?
  email: 'olalonde@gmail.com'
  location: beijing
  fullName: function () {
    return this.name.first + ' ' + this.name.last;
  },
  followers: [ oli, jo ], // watch out for recursion!
  following: [ $.id(1) ] // reference by ID!
});
// todo: how to offer created_at, updated_at functionality

// saves object and its childs (that are dirty), running validations on each child as well
$.save(oli).end(function (err, user) {});
// alternative syntaxes: $.save(oli, opts, fn) $.save(oli, fn)
// alternative syntax? $(oli).save ?

// create is the same as save except it does not run validations
$.save(oli).validate(false).end(function (err, user) {});

// eager loading
// every object is cached using their UUID. also queries and their results are memoized
// at worm level, not adapter level. on a web server it is smart to use a different
// worm instance so that the cache wont be shared among requests?
$.get($.User).where({ id: 1 }).include('followers': {
  // all this converted to $.Expression.include ?
  sort: 'email', // converted to $.Expression.sort?
  // alternative syntax: where: 'followers.location.name = "Beijing" and name = /^O/i'
  where: $.Expression.where(
    {
      lvalue: { lvalue: 'followers.location.name', operator: 'equal', rvalue: 'Beijing'  },
      operator: 'and',
      rvalue: [ 'name', 'regex', /^O/i ]
    }
  )
}).end(function (err, user) {

});

// lazy loading
// let's say we loaded a user but we are not sure if its location,followers are loaded
// alernative syntax: $.get($.User, 1) ?
// alternative syntax: $.User.get(1), $.User.get().id(1)
$.get($.User).id(1).end(function (err, user) {
  user = $(user);
  user.load('location').load('followers', { 'location.country': 'China' }).end(function (err, user) {
    //wow
    console.log(user.location);
    console.log(user.followers);
  });
  // alternative syntax
  // followersInChina is a virtual attribute defined in the schema
  user.load('location').load('followersInChina').end(function () {
    console.log(user.location);
    console.log(user.followersInChina);
  });
});

// get one location
$.getAll($.Location).where({ country: 'China' }).end(function (err, location) {


});

// $.get automatically limits to one result, getAll does not
$.getAll($.Location).end(function (err, locations) {});

// alternative syntax: $.get($.Location, { where: { city: 'montreal' } }, function () {});


// destroy an object (childs where it makes sense?)
$.destroy(oli).end(function (err, res) {});
// alternative syntax $(oli).destroy().end(); etc.
