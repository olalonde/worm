var $ = require('../../'),
  debug = require('../../lib/debug')('test:common'),
  adapter_name = 'sql', // default adapter
  opts,
  adapter;

if (process.env.ADAPTER) {
  adapter_name = process.env.ADAPTER;
}

if (adapter_name === 'sql') {
  opts = 'postgres://localhost/level2';
  if (process.env.TRAVIS) {
    opts = 'postgres://postgres:@localhost/level2';
  }
}

adapter = $.adapter($.adapters[adapter_name](opts), 'test');

var pretest = function (cb) {
  debug('Flushing database');

  if (adapter_name === 'sql') {
    adapter.raw.query('TRUNCATE TABLE persons;TRUNCATE TABLE passports;', cb);
  }
  else {
    adapter.flush(cb);
  }
};

// @TODO: make it easy to build models with model builder functions? etc.
// @TODO: make it easy to take Sequelize model and convert it?

var Person = $.model({
  name: 'Person',
  attributes: [ 'id', 'name', 'passport_id', 'bestfriend_id' ],
  relationships: {
    passport: {
      type: 'hasOne',
      model: 'Passport'
    },
    bestFriend: {
      // self reference... watch out for recursion!
      // also, best friend could be yourself! test edge cases
      type: 'hasOne',
      model: 'Person'
    }
    // @TODO: how to handle polymorphic relationships?
    // For example: object_id, and object_type
    // How about:
    //something: {
      //type: 'hasOne',
      //model: { attribute: 'something_type' }
      // or
      //model: function (obj) {
        //return obj.something_type;
      //}
    //}
  },
  //@TODO
  //map: {
    //sql: {
      ////adapter specific configuration. anything can go here from
      ////functions to objects? that can help the adapter translate the
      ////javascript representation to database representation
    //}
  //},
  adapters: [ 'test' ]
});

var Passport = $.model({
  name: 'Passport',
  attributes: [ 'id', 'code', 'country' ],
  relationships: {
    person: {
      type: 'belongsTo', //make sure its linked both ways!
      model: 'Person'
    }
  },
  adapters: [ 'test' ]
});

var passportoli = {
  code: '1337',
  country: 'Canada'
};

var passportderek = {
  code: 'SGP123',
  country: 'Singapore'
};

var passportcasey = {
  code: 'US123',
  country: 'USA'
};

var oli = {
  name: 'oli',
};

var derek = {
  name: 'derek',
};

var casey = {
  name: 'casey',
};

module.exports = {
  pretest: pretest,
  Person: Person,
  Passport: Passport,
  oli: oli,
  derek: derek,
  casey: casey,
  passportoli: passportoli,
  passportderek: passportderek,
  passportcasey: passportcasey
};
