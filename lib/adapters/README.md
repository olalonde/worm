Adapters must expose:

```javascript
adapter.name = 'unique identifier for the adapter'

/**
 * @param worm.Query query
 * @param worm.Model model
 * @param Object values (attribute -> value hash)
 * @param Function cb function (err, res) {} res must be an array of
plain objects or an object
 */
adapter.execute = function (query, model, values, cb) {}

/**
 * flushes the database (erase all data ?and meta data?) 
 */
adapter.flush = function (cb) {}

/**
 * raw access to whatever the adapter is using
 * for sql that is a anydb.conn 
 */
adapter.raw 
```

TODO: all adapters should inherit from a base adapter?
