var adapters = require('./adapters/'),
  _adapters = {};

/**
 * Get or register an adapter
 *
 * adapter()
 *
 * @argument String|adaper adapter
 * @argument String label Optional label that will be used to reference
 * to the adapter
 */
var adapter = function (adapter, label) {
  if (typeof adapter === 'string') {
    if(!_adapters[adapter])
      throw new Error('Adapter ' + adapter + ' does not exits.');
    return _adapters[adapter];
  }

  label = label || adapter.name;
  _adapters[label] = adapter;
  return adapter;
};

module.exports = {
  adapters: adapters,
  _adapters: _adapters,
  adapter: adapter
};
