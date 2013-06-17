-- postgresql
-- @TODO: foreign constraints

DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS comments;

CREATE TABLE posts (
   id SERIAL,
   title character varying(255),
   author_id integer,
   CONSTRAINT user_primary_key PRIMARY KEY (id)
);

-- @TODO: dont require comments to have an ID. they can be identified
-- only with post_id
CREATE TABLE comments (
   id SERIAL,
   post_id integer,
   text character varying(255),
   CONSTRAINT comment_primary_key PRIMARY KEY (id)
);

CREATE TABLE authors (
   id SERIAL,
   name character varying(255),
   CONSTRAINT author_primary_key PRIMARY KEY (id)
);
