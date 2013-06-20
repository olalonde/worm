- Sugar: make the ugly syntaxes go away!
- Verbose option to know what's going on
- Implement sql adapter
- Get rid of util and use _.js instead
- Should be able to mass save collections: $.wrap(User, []).save() ?
- Idea: disregard cache: savee, disregard cache and validations: saveee, etc.  LOL :)
- Handle created_at updated_at! maybe that should be a presave hook instead of bloating the core?
- Bug when defining model with same name more than once
- Implement automatic lazy loading using function generators??
- Use a task queue for db operations... this would allow us to add
operations anywhere in the code. Would be helpful for self-referential
relationships... if self referential relationship detected, add update
to queue that updates the referenced ID?
- Handle cycles nicely when saving/updating an object graph
- HTML adapter lol: writes your data to HTML files. objects are linked
by <a> links

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

More TODOs:

`ack TODO --ignore-dir node_modules`
