- make sure objects returned by get / getAll are wrapped! need to write a
test for that as it does not appear to be the case at the moment.

- upserts and software fallback if adapter does not support
- $.reload($inst) -> force reload even if object is cached
- test errors. make sure nothing fails silently
- attache query object to instances ($inst.loadedWith ?) to remember how they were loaded.
  that could be helpful when we implement reload

- write localStorage/IndexedDB and REST adapters

- make it easy to do auto completion on properties? uhhhh?

```javascript
$.autocomplete(Model, attribute, 'some string to be autocompleted', function (res) {
  
});
```

should probably not be part of core...

- support polymorphies (i.e.: object_id = 123 object_type = 'order' or object_id = 123 and object_type = 'comment')


