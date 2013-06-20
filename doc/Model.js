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
