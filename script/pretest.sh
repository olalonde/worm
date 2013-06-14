echo "DELETE FROM users" | psql worm-test
#dropdb worm-test;
createdb worm-test;
psql worm-test < script/database.sql;
