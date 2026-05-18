-- Create the test database alongside the main one
SELECT 'CREATE DATABASE courier_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'courier_test')\gexec
