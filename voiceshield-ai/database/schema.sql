-- VoiceShield AI Database Schema (PostgreSQL 16)

CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
    api_key VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_policies (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    high_value_threshold DOUBLE PRECISION DEFAULT 1000000.0,
    critical_risk_threshold DOUBLE PRECISION DEFAULT 80.0,
    high_risk_threshold DOUBLE PRECISION DEFAULT 60.0,
    medium_risk_threshold DOUBLE PRECISION DEFAULT 30.0,
    weight_synthetic DOUBLE PRECISION DEFAULT 0.35,
    weight_speaker DOUBLE PRECISION DEFAULT 0.25,
    weight_prosody DOUBLE PRECISION DEFAULT 0.10,
    weight_caller DOUBLE PRECISION DEFAULT 0.10,
    weight_behavior DOUBLE PRECISION DEFAULT 0.10,
    weight_transaction DOUBLE PRECISION DEFAULT 0.10,
    audio_retention_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS voice_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    speaker_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    voiceprint_encrypted TEXT NOT NULL,
    sample_duration_sec DOUBLE PRECISION DEFAULT 0.0,
    audio_format VARCHAR(50) DEFAULT 'audio/wav',
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calls (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    caller_phone VARCHAR(50) NOT NULL,
    caller_name VARCHAR(255) DEFAULT 'Unknown Caller',
    claimed_identity VARCHAR(255) DEFAULT 'Unknown',
    channel VARCHAR(50) DEFAULT 'VoIP',
    language VARCHAR(50) DEFAULT 'en',
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    risk_score DOUBLE PRECISION DEFAULT 0.0,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    duration_seconds INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS call_risk_events (
    id VARCHAR(36) PRIMARY KEY,
    call_id VARCHAR(36) NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synthetic_score DOUBLE PRECISION DEFAULT 0.0,
    speaker_score DOUBLE PRECISION DEFAULT 0.0,
    prosody_score DOUBLE PRECISION DEFAULT 0.0,
    behavior_score DOUBLE PRECISION DEFAULT 0.0,
    context_score DOUBLE PRECISION DEFAULT 0.0,
    overall_risk DOUBLE PRECISION DEFAULT 0.0,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    contributing_factors JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    call_id VARCHAR(36) REFERENCES calls(id) ON DELETE SET NULL,
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    beneficiary_name VARCHAR(255) NOT NULL,
    beneficiary_account VARCHAR(100) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    risk_score DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_requests (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) REFERENCES transactions(id) ON DELETE SET NULL,
    call_id VARCHAR(36) REFERENCES calls(id) ON DELETE SET NULL,
    method VARCHAR(50) DEFAULT 'SMS_OTP',
    target_contact VARCHAR(255) NOT NULL,
    challenge_code VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    risk_before DOUBLE PRECISION DEFAULT 0.0,
    risk_after DOUBLE PRECISION,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(36) PRIMARY KEY,
    call_id VARCHAR(36) REFERENCES calls(id) ON DELETE SET NULL,
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    caller VARCHAR(255) NOT NULL,
    claimed_identity VARCHAR(255) NOT NULL,
    risk_score DOUBLE PRECISION NOT NULL,
    threat_type VARCHAR(255) NOT NULL,
    transaction_id VARCHAR(36) REFERENCES transactions(id) ON DELETE SET NULL,
    recommended_action VARCHAR(100) DEFAULT 'BLOCK',
    actual_action VARCHAR(100) DEFAULT 'TRANSACTION_HELD',
    status VARCHAR(50) DEFAULT 'OPEN',
    timeline JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    metadata_json JSONB DEFAULT '{}',
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calls_org ON calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_transactions_call ON transactions(call_id);
CREATE INDEX IF NOT EXISTS idx_incidents_org ON incidents(organization_id);
