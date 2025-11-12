-- Keycloak Logs Database Schema
-- Database: keycloak_logs
-- Version: 1.0

-- ═══════════════════════════════════════════════════════
-- Authentication Logs Table
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS auth_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL,
    realm VARCHAR(100),
    client_id VARCHAR(100),
    user_id VARCHAR(255),
    username VARCHAR(255),
    email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    error_message TEXT,
    success BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for auth_logs
CREATE INDEX IF NOT EXISTS idx_auth_logs_timestamp ON auth_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auth_logs_event_type ON auth_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_realm ON auth_logs(realm);
CREATE INDEX IF NOT EXISTS idx_auth_logs_success ON auth_logs(success);
CREATE INDEX IF NOT EXISTS idx_auth_logs_username ON auth_logs(username);

-- ═══════════════════════════════════════════════════════
-- Admin Activity Logs Table
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    operation_type VARCHAR(50),
    resource_type VARCHAR(100),
    resource_path TEXT,
    admin_user_id VARCHAR(255),
    admin_username VARCHAR(255),
    realm VARCHAR(100),
    representation JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for admin_logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_operation ON admin_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_username);
CREATE INDEX IF NOT EXISTS idx_admin_logs_realm ON admin_logs(realm);

-- ═══════════════════════════════════════════════════════
-- Performance Metrics Table (Optional)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metric_type VARCHAR(50) NOT NULL,
    value NUMERIC,
    labels JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance_metrics
CREATE INDEX IF NOT EXISTS idx_perf_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_perf_metric_type ON performance_metrics(metric_type);

-- ═══════════════════════════════════════════════════════
-- Comments for Documentation
-- ═══════════════════════════════════════════════════════

COMMENT ON TABLE auth_logs IS 'Stores authentication events from Keycloak';
COMMENT ON COLUMN auth_logs.event_type IS 'LOGIN, LOGOUT, TOKEN_REFRESH, REGISTER, etc.';
COMMENT ON COLUMN auth_logs.success IS 'Whether the authentication attempt was successful';
COMMENT ON COLUMN auth_logs.metadata IS 'Additional JSON data about the event';

COMMENT ON TABLE admin_logs IS 'Stores administrative actions performed in Keycloak';
COMMENT ON COLUMN admin_logs.operation_type IS 'CREATE, UPDATE, DELETE, etc.';
COMMENT ON COLUMN admin_logs.representation IS 'JSON representation of the resource';

COMMENT ON TABLE performance_metrics IS 'Stores performance and system metrics';

-- ═══════════════════════════════════════════════════════
-- Data Retention Functions (Optional)
-- ═══════════════════════════════════════════════════════

-- Function to clean old logs (run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS void AS $$
BEGIN
    DELETE FROM auth_logs WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    DELETE FROM admin_logs WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
    DELETE FROM performance_metrics WHERE timestamp < NOW() - INTERVAL '1 day' * days_to_keep;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════
-- Initial Setup Complete
-- ═══════════════════════════════════════════════════════

-- Verify tables were created
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;