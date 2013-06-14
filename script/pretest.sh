echo "DELETE FROM users" | psql wormtest
#dropdb worm-test;
createdb wormtest;
psql wormtest < script/database.sql;
