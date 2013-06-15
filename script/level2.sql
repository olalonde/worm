-- postgresql
DRPP TABLE users;
DROP TABLE passports;

CREATE TABLE users
(
   id SERIAL,
   name character varying(255),
   passport_id integer,
   bestfriend_id integer,
   CONSTRAINT user_primary_key PRIMARY KEY (id)
   -- @TODO: foreign constraint on location
);

CREATE TABLE passports
(
   id SERIAL,
   code character varying(255),
   country character varying(255),
   CONSTRAINT passport_primary_key PRIMARY KEY (id)
);
