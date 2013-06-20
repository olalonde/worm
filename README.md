[![Build Status](https://travis-ci.org/olalonde/worm.png)](https://travis-ci.org/olalonde/worm) [![NPM version](https://badge.fury.io/js/worm.png)](http://badge.fury.io/js/worm)

# THIS IS A WORK IN PROGRESS
# THIS IS A WORK IN PROGRESS
# THIS IS A WORK IN PROGRESS
# See [test/](test/) to get a glimpse

## Design Goals

  - Philosophy
    - Simple, developer-friendly API
    - Gets out of the way
    - Leverage Javascript's primitives 
    - High level of abstraction.
    - Avoid becoming a [leaky abstraction](http://en.wikipedia.org/wiki/Leaky_abstraction).
    - Modular and extensible. 
      - Keep core lean.
      - Extract functionality into standalone packages.
    - Make it run, make it beautiful, make it right, make it fast.
    - Functional style (TODO)
    - Don't pollute functions with syntax sugar.

  - Support multiple databases
    - PostgreSQL
    - MySQL (not tested)
    - SQLite (not tested)
    - MongoDB (TODO)
    - REST (TODO)

  - Caching support
  - Support polymorphism (TODO)
  - Support eager and lazy loading
  - Support convention over configuration
  - Extensible through hooks and events

  - Browser compatibility (TODO)

## `$`

In the documentation, `$` refers to the main `worm` module as in 
`var $ = require('worm');`

## `$obj`

In the documentation, `$obj` notation refers to a wrapped object, also known as
an instance. See Instance section.

## Adapter

An adapter is a bridge between `worm` and actual databases. It can
understand worm queries and translate those queries to a language that
an underlying database can understand. For example, a Github `REST` adapter
might translate the following query to an HTTP GET call to 
`http://github.com/olalonde.json`: 

```javascript
  $.get(User).id('olalonde'); // -> worm query
```

### Officially supported adapters

- SQL (PostgreSQL, MySQL, SQLite)

An SQL adapter can be instantiated by passing a connection string.

```javascript
var mydbadapter = $.adapters.sql('postgres://localhost/dbname');
```

Internally the SQL adapter uses the
[any-db](https://github.com/grncdr/node-any-db) module.

- MongoDB (TODO)
- REST (TODO)

### Building your own adapter

See (lib/adapters/README.md)[lib/adapters/README.md].

## Model

A model is a Javascript object containing meta data describing how
an instance should behave. It may contain a list of attributes, how 
it's unique ID is defined, relationships, validations and adapters.

It is the analoguous of Rails' `ActiveModel`, JugglingDB's `models` and
Sequelize's `schemas`.

Example user model:

```javascript
var User = $.model({

  /**
   * @property string name 
   *
   * Unique identifier. This identifier will be used when defining
   * relationships.
   */

  name: 'User',

  /**
   * @property Array attributes
   *
   * List of properties available on instances. If an attribute
   * references an instance or an array of instances, it should
   * instead be defined as a relationship.
   *
   * Together, attributes and relationships describe the properties
   * of an instance.
   * 
   */
  
  attributes: [ 'id', 'name', 'email' ],

  /**
   * @property Array relationships (optional)
   *
   * Collection of relationships. Relationships are used to describe
   * "attributes" that refer to other instance(s).
   *
   * Together, attributes and relationships describe the properties
   * of an instance.
   *
   */

  relationships: {
    // name of the property the relationship is assigned to
    friends: {
      // type of relationship: hasMany or hasOne
      type: 'hasMany',
      // model the relationship refers to
      model: 'User'
    }
  },

  /**
   * @property Object validates (optional)
   *
   * Maps validators to properties.
   *
   */
  validates: {
    presence_of: [ 'name', 'email' ],
    is_email: [ 'email' ],
    // first array element is passed to validator if its not an
    // attribute
    regex: {
      args: [ /^[A-Za-z]+$/i ],
      properties: [ 'name' ]
    }
  },

  /**
   * @property Object validators (optional)
   *
   * Maps validator identifiers to validation predicates or validation
   * predicate generators. (A predicate is a function that returns
   * `true` of `false`)
   *
   * Predicates are called with the following arguments:
   *
   * @param mixed value Value to test.
   * @param string property Property being tested.
   *
   * They also have access to the `this` object on which they can
   * register an error name and message for if the validation fails. In 
   * addition, `this.obj` exposes the object on which the property being tested
   * is attached.
   * 
   * For example:
   *
   * ```
   * this.name = 'presence_of'; 
   * this.message = property + ' is not present.'`
   * ```
   *
   * Predicate generators are called with the arguments listed in
   * `validates[generator_name].args`. In this example, the regex generator
   * will be called with `/^[A-Za-z]+$/i` for the `name` property.
   *
   * Predicate generators must return a predicate.
   *
   */
  validators: {
    presence_of: function (value, property) {
      this.name = 'Not present';
      this.message = attribute + ' is not present.';
      return (typeof value !== 'undefined');
    },
    regex: function (regex) {
      return function (value) {
        this.name = 'Invalid regex';
        this.message = attribute + ' does not satisfy the regex ' + regex + '.';
        return regex.test(value);
      };
    },
    is_email: function (value) {
      this.name = 'Invalid email';
      return (/[^\s]+@[^\s]+/).test(value);
    }
  },

  /**
   * @property Array adapters (optional) list of adapter identifiers
   *
   * For more information on adapters, refer to the Adapter section.
   *
   */
  adapters: [ 'myadapter' ]

}); 
```

## Instance

An instance is an internal representation of an object, which model
defines it and how it should be persisted. It knows about a few things
like how an object retrieved from the databse, which of its properties 
have changed since then, etc.

Instances can also represent collections of instances.

As an end user, you don't need to know about instances. You will typically
operate directly on plain Javascript objects and arrays. You will only need
to "wrap" an object before passing it to a worm query.

For example: 

```javascript
$.save($.wrap(User, { name: 'oli' })).end();
```

`$.wrap([Model, ]obj)` returns the instance of an object. If it is the
first time you wrap an object, you need to specify the model of the
object.

## Queries

Queries are a database agnostic way to retrieve, save (create/update) and delete
objects.

The following worm methods create initialized queries that are passed to adapters
when `.end()` is called.

```javascript
$.get(Model, id)
$.getAll(Model)
$.save($obj)
$.destroy($obj)
```

For more information on query syntax, refer to the [tests](test/).

# TODO

See [TODO.md](TODO.md)

# References

http://martinfowler.com/eaaCatalog/

https://github.com/olalonde/dORM/

http://sequelizejs.com/

http://jugglingdb.co

https://github.com/grncdr/node-any-db

Adapters:

https://github.com/jugglingdb/postgres-adapter/blob/master/lib/postgres.js

Model/validations:

https://github.com/rails/rails/tree/master/activemodel

http://api.rubyonrails.org/classes/ActiveModel/Validations.html

http://guides.rubyonrails.org/active_record_validations_callbacks.html

