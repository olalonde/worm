-- postgresql
-- @TODO: foreign constraints
DROP TABLE IF EXISTS people;
DROP TABLE IF EXISTS passports;

-- person's plural is people
CREATE TABLE people (
   id SERIAL,
   name character varying(255),
   passport_id integer,
   bestfriend_id integer,
   CONSTRAINT user_primary_key PRIMARY KEY (id)
);

CREATE TABLE passports (
   id SERIAL,
   code character varying(255),
   country character varying(255),
   CONSTRAINT passport_primary_key PRIMARY KEY (id)
);
