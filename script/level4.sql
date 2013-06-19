-- postgresql
-- @TODO: foreign constraints

DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS employees;

-- @TODO: watch out, plural of company is companies, not companys!
CREATE TABLE companies (
   id SERIAL,
   name character varying(255),
   CONSTRAINT company_primary_key PRIMARY KEY (id)
);

-- join table
-- @TODO: primary key could be (company_id, employee_id, type)
CREATE TABLE roles (
  id SERIAL,
  company_id integer,
  employee_id integer,
  "type" character varying(255),
  CONSTRAINT role_primary_key PRIMARY KEY (id)
);

CREATE TABLE employees (
   id SERIAL,
   name character varying(255),
   CONSTRAINT employee_primary_key PRIMARY KEY (id)
);
