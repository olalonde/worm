-- level1flat
CREATE TABLE level1_users
(
   id SERIAL,
   name_first character varying(255),
   name_last character varying(255),
   location character varying(255),
   email character varying(255),
   password character varying(255),
   CONSTRAINT user_primary_key PRIMARY KEY (id)
);

--level2one2one
CREATE TABLE level2_company
(
   id SERIAL,
   city character varying(255),
   country character varying(255),
   ceo_id 
   CONSTRAINT location_primary_key PRIMARY KEY (id)
);

CREATE TABLE person
(
   id SERIAL,
   city character varying(255),
   country character varying(255),
   CONSTRAINT location_primary_key PRIMARY KEY (id)
);
