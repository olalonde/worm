# THIS IS A WORK IN PROGRESS
# THIS IS A WORK IN PROGRESS
# THIS IS A WORK IN PROGRESS

## See [test/](test/) to get a glimpse

# TODO

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

[![Build Status](https://travis-ci.org/olalonde/worm.png)](https://travis-ci.org/olalonde/worm) [![NPM version](https://badge.fury.io/js/worm.png)](http://badge.fury.io/js/worm)

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

