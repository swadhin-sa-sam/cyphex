from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRoleEnum(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    SECURITY_ANALYST = "SECURITY_ANALYST"
    ADMIN = "ADMIN"

class RiskLevelEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    organization: Optional[str] = "demo.com"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    organization_id: str
    is_active: bool

# Call Schemas
class CallCreate(BaseModel):
    caller_phone: str
    caller_name: Optional[str] = "Incoming Call"
    claimed_identity: Optional[str] = "Unknown"
    channel: Optional[str] = "VoIP"
    language: Optional[str] = "en"

class CallResponse(BaseModel):
    id: str
    caller_phone: str
    caller_name: str
    claimed_identity: str
    channel: str
    language: str
    status: str
    risk_score: float
    risk_level: str
    duration_seconds: int
    start_time: datetime

# Audio & ML Signals
class VoicePrediction(BaseModel):
    synthetic_probability: float
    confidence: float
    model_version: str = "demo-v1"
    anomaly_flags: List[str] = Field(default_factory=list)

class SpeakerMatchResult(BaseModel):
    match_score: float
    verified: bool
    confidence: float
    claimed_speaker: str

class BehaviorResult(BaseModel):
    behavior_risk_score: float
    urgency_detected: bool = False
    secrecy_detected: bool = False
    financial_request: bool = False
    otp_request: bool = False
    credential_request: bool = False
    policy_bypass: bool = False
    authority_claim: bool = False
    unusual_instruction: bool = False
    detected_phrases: List[str] = Field(default_factory=list)

class ContextRiskResult(BaseModel):
    caller_anomaly: float
    transaction_risk: float
    context_risk: float
    risk_factors: List[str] = Field(default_factory=list)

class RiskFactorBreakdown(BaseModel):
    factor: str
    impact_points: int
    description: str

class RiskResult(BaseModel):
    overall_risk: float = Field(..., ge=0, le=100)
    risk_level: RiskLevelEnum
    action_recommended: str
    synthetic_score: float
    speaker_score: float
    prosody_score: float
    caller_anomaly_score: float
    behavior_score: float
    transaction_risk_score: float
    contributing_factors: List[RiskFactorBreakdown] = Field(default_factory=list)
    why_risky: List[str] = Field(default_factory=list)
    latency_ms: float = 0.0

# Transaction Schemas
class TransactionCreate(BaseModel):
    call_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    beneficiary_name: str
    beneficiary_account: str
    requested_by: str
    notes: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    call_id: Optional[str]
    amount: float
    currency: str
    beneficiary_name: str
    beneficiary_account: str
    requested_by: str
    risk_score: float
    status: str
    notes: Optional[str]
    created_at: datetime

# Verification Schemas
class VerificationRequestCreate(BaseModel):
    transaction_id: Optional[str] = None
    call_id: Optional[str] = None
    method: str = "SMS_OTP"
    target_contact: Optional[str] = None

class VerificationConfirm(BaseModel):
    verification_id: str
    challenge_code: str

# Incident Schemas
class IncidentResponse(BaseModel):
    id: str
    call_id: Optional[str]
    caller: str
    claimed_identity: str
    risk_score: float
    threat_type: str
    transaction_id: Optional[str]
    recommended_action: str
    actual_action: str
    status: str
    timeline: List[Dict[str, Any]]
    created_at: datetime

# Dashboard KPIs
class DashboardStats(BaseModel):
    calls_today: int
    suspicious_calls: int
    critical_threats: int
    transactions_protected_amount: float
    risk_over_time: List[Dict[str, Any]]
    threat_distribution: List[Dict[str, Any]]
    calls_by_risk_level: List[Dict[str, Any]]
    recent_events: List[Dict[str, Any]]

# Settings
class SettingsResponse(BaseModel):
    high_value_threshold: float
    critical_risk_threshold: float
    high_risk_threshold: float
    medium_risk_threshold: float
    weight_synthetic: float
    weight_speaker: float
    weight_prosody: float
    weight_caller: float
    weight_behavior: float
    weight_transaction: float
    audio_retention_days: int

class SettingsUpdate(BaseModel):
    high_value_threshold: Optional[float] = None
    critical_risk_threshold: Optional[float] = None
    audio_retention_days: Optional[int] = None
    weight_synthetic: Optional[float] = None
    weight_speaker: Optional[float] = None
