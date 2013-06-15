#echo "DELETE FROM users" | psql wormtest
#dropdb worm-test;
#createdb wormtest;
psql level1 < script/level1.sql;
psql level2 < script/level2.sql;
