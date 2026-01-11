CREATE DATABASE auth_service;
CREATE DATABASE shortener_service;
CREATE DATABASE audit_log_service;

\c auth_service
CREATE SCHEMA auth;

\c shortener_service
CREATE SCHEMA shortener;

\c audit_log_service
CREATE SCHEMA audit_log;
