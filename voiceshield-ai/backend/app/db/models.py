import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, 
    Text, Enum as SQLEnum, JSON, Index
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserRole(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    SECURITY_ANALYST = "SECURITY_ANALYST"
    ADMIN = "ADMIN"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class CallStatus(str, Enum):
    RINGING = "RINGING"
    IN_PROGRESS = "IN_PROGRESS"
    VERIFIED = "VERIFIED"
    SUSPICIOUS = "SUSPICIOUS"
    BLOCKED = "BLOCKED"
    ENDED = "ENDED"

class TransactionStatus(str, Enum):
    PENDING = "PENDING"
    ON_HOLD = "ON_HOLD"
    VERIFICATION_REQUIRED = "VERIFICATION_REQUIRED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class VerificationMethod(str, Enum):
    SMS_OTP = "SMS_OTP"
    AUTHENTICATOR = "AUTHENTICATOR"
    SECURE_CALLBACK = "SECURE_CALLBACK"
    MANAGER_APPROVAL = "MANAGER_APPROVAL"

class VerificationStatus(str, Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    EXPIRED = "EXPIRED"

class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    VERIFIED = "VERIFIED"
    BLOCKED = "BLOCKED"
    RESOLVED = "RESOLVED"

# 1. Organization
class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    policies = relationship("RiskPolicy", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    calls = relationship("Call", back_populates="organization")

# 2. User
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.EMPLOYEE.value, nullable=False)
    api_key = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")
    voice_profile = relationship("VoiceProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

# 3. Voice Profile (VIP / Employee Biometric Enrollment)
class VoiceProfile(Base):
    __tablename__ = "voice_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    speaker_name = Column(String(255), nullable=False)
    role_title = Column(String(255), nullable=False)
    voiceprint_encrypted = Column(Text, nullable=False) # AES-256 encrypted embedding vector
    sample_duration_sec = Column(Float, default=0.0)
    audio_format = Column(String(50), default="audio/wav")
    is_active = Column(Boolean, default=True)
    verified_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="voice_profile")

# 4. Call
class Call(Base):
    __tablename__ = "calls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    caller_phone = Column(String(50), nullable=False)
    caller_name = Column(String(255), default="Unknown Caller")
    claimed_identity = Column(String(255), default="Unknown")
    channel = Column(String(50), default="VoIP")
    language = Column(String(50), default="en")
    status = Column(String(50), default=CallStatus.IN_PROGRESS.value)
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String(50), default=RiskLevel.LOW.value)
    duration_seconds = Column(Integer, default=0)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)

    organization = relationship("Organization", back_populates="calls")
    risk_events = relationship("CallRiskEvent", back_populates="call", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="call")
    incidents = relationship("Incident", back_populates="call")

# 5. Call Risk Event (Continuous telemetry stream)
class CallRiskEvent(Base):
    __tablename__ = "call_risk_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    call_id = Column(String(36), ForeignKey("calls.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    synthetic_score = Column(Float, default=0.0)
    speaker_score = Column(Float, default=0.0)
    prosody_score = Column(Float, default=0.0)
    behavior_score = Column(Float, default=0.0)
    context_score = Column(Float, default=0.0)
    overall_risk = Column(Float, default=0.0)
    risk_level = Column(String(50), default=RiskLevel.LOW.value)
    contributing_factors = Column(JSON, default=list)

    call = relationship("Call", back_populates="risk_events")

# 6. Transaction (Financial action protection)
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    call_id = Column(String(36), ForeignKey("calls.id"), nullable=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    beneficiary_name = Column(String(255), nullable=False)
    beneficiary_account = Column(String(100), nullable=False)
    requested_by = Column(String(255), nullable=False)
    risk_score = Column(Float, default=0.0)
    status = Column(String(50), default=TransactionStatus.PENDING.value)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    call = relationship("Call", back_populates="transactions")
    verifications = relationship("VerificationRequest", back_populates="transaction")

# 7. Verification Request (MFA, Callback, Manager Approval)
class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=True)
    call_id = Column(String(36), ForeignKey("calls.id"), nullable=True)
    method = Column(String(50), default=VerificationMethod.SMS_OTP.value)
    target_contact = Column(String(255), nullable=False)
    challenge_code = Column(String(50), nullable=False)
    status = Column(String(50), default=VerificationStatus.PENDING.value)
    risk_before = Column(Float, default=0.0)
    risk_after = Column(Float, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="verifications")

# 8. Incident
class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=lambda: f"VC-{int(datetime.utcnow().timestamp())%100000:05d}")
    call_id = Column(String(36), ForeignKey("calls.id"), nullable=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    caller = Column(String(255), nullable=False)
    claimed_identity = Column(String(255), nullable=False)
    risk_score = Column(Float, nullable=False)
    threat_type = Column(String(255), nullable=False)
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=True)
    recommended_action = Column(String(100), default="BLOCK")
    actual_action = Column(String(100), default="TRANSACTION_HELD")
    status = Column(String(50), default=IncidentStatus.OPEN.value)
    timeline = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    call = relationship("Call", back_populates="incidents")

# 9. Audit Log (DPDP & Compliance)
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    metadata_json = Column(JSON, default=dict)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow)

# 10. Risk Policy (Configurable organization policies)
class RiskPolicy(Base):
    __tablename__ = "risk_policies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, unique=True)
    high_value_threshold = Column(Float, default=1000000.0) # ₹10,00,000
    critical_risk_threshold = Column(Float, default=80.0)
    high_risk_threshold = Column(Float, default=60.0)
    medium_risk_threshold = Column(Float, default=30.0)
    
    # Configurable weights
    weight_synthetic = Column(Float, default=0.35)
    weight_speaker = Column(Float, default=0.25)
    weight_prosody = Column(Float, default=0.10)
    weight_caller = Column(Float, default=0.10)
    weight_behavior = Column(Float, default=0.10)
    weight_transaction = Column(Float, default=0.10)
    
    audio_retention_days = Column(Integer, default=0) # 0 = No retention
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="policies")
