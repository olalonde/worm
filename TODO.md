- make sure objects returned by get / getAll are wrapped! need to write a
test for that as it does not appear to be the case at the moment.

- upserts and software fallback if adapter does not support
- $.reload($inst) -> force reload even if object is cached
- test errors. make sure nothing fails silently
