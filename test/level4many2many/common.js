var $ = require('../../'),
  debug = require('debug')('worm:test'),
  adapter_name = 'sql', // default adapter
  opts,
  adapter;

if (process.env.ADAPTER) {
  adapter_name = process.env.ADAPTER;
}

if (adapter_name === 'sql') {
  opts = 'postgres://localhost/level4';
  if (process.env.TRAVIS) {
    opts = 'postgres://postgres:@localhost/level4';
  }
}

adapter = $.adapter($.adapters[adapter_name](opts), 'test4');

var pretest = function (cb) {
  debug('Flushing database');

  $.cache.clear(next);

  // @TODO: replace this by $.destroyAll
  function next() {
    if (adapter_name === 'sql') {
      adapter.raw.query('TRUNCATE TABLE roles;TRUNCATE TABLE employees;TRUNCATE TABLE companies;', cb);
    }
    else {
      adapter.flush(cb);
    }
  }
};

// @TODO support direct relationship without going through join table
var Company = $.model({
  name: 'Company',
  attributes: [ 'id', 'name' ],
  relationships: {
    roles: {
      type: 'hasMany',
      model: 'Role'
    }
  },
  adapters: [ 'test4' ]
});

// join table
var Role = $.model({
  name: 'Role',
  attributes: [ 'id', 'company_id', 'employee_id', 'type' ],
  relationships: {
    company: {
      type: 'hasOne',
      model: 'Company'
    },
    employee: {
      type: 'hasOne',
      model: 'Employee'
    }
  },
  adapters: [ 'test4' ]
});

var Employee = $.model({
  name: 'Employee',
  attributes: [ 'id', 'name' ],
  relationships: {
    roles: {
      type: 'hasMany',
      model: 'Role'
    }
  },
  adapters: [ 'test4' ]
});

module.exports = {
  pretest: pretest,
  Company: Company,
  Role: Role,
  Employee: Employee
};
