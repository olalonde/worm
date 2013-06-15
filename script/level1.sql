-- postgresql
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
   id SERIAL,
   name_first character varying(255),
   name_last character varying(255),
   location character varying(255),
   email character varying(255),
   password character varying(255),
   CONSTRAINT user_primary_key PRIMARY KEY (id)
);

