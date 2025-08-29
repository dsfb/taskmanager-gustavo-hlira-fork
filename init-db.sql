-- Initialization script for TaskManager database
-- This script runs when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (already handled by POSTGRES_DB)
-- CREATE DATABASE IF NOT EXISTS taskmanager_db;

-- Create user if it doesn't exist (already handled by POSTGRES_USER)
-- CREATE USER IF NOT EXISTS taskmanager_user WITH PASSWORD 'taskmanager_password';

-- Grant privileges (already handled by PostgreSQL container)
-- GRANT ALL PRIVILEGES ON DATABASE taskmanager_db TO taskmanager_user;

-- Enable extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (will be created by Django migrations)
-- These are just examples, actual indexes will be created by Django

SELECT 'TaskManager database initialized successfully!' as message;

