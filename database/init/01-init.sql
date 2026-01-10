CREATE USER auth_app_readwrite WITH PASSWORD 'auth_s3cr3t_k3y';
CREATE USER shortener_app_readwrite WITH PASSWORD 'shortener_s3cr3t_k3y';
CREATE USER audit_log_app_readwrite WITH PASSWORD 'audit_log_s3cr3t_k3y';

CREATE DATABASE auth_service OWNER auth_app_readwrite;
CREATE DATABASE shortener_service OWNER shortener_app_readwrite;
CREATE DATABASE audit_log_service OWNER audit_log_app_readwrite;

\c auth_service
CREATE SCHEMA auth AUTHORIZATION auth_app_readwrite;

\c shortener_service
CREATE SCHEMA shortener AUTHORIZATION shortener_app_readwrite;

\c audit_log_service
CREATE SCHEMA audit_log AUTHORIZATION audit_log_app_readwrite;
