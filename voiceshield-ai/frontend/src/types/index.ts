export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'SECURITY_ANALYST' | 'ADMIN';
  organization_id: string;
}

export interface ContributingFactor {
  factor: string;
  impact_points: number;
  description: string;
}

export interface RiskResult {
  overall_risk: number;
  risk_level: RiskLevel;
  action_recommended: string;
  synthetic_score: number;
  speaker_score: number;
  speaker_mismatch?: number;
  prosody_score: number;
  caller_anomaly_score: number;
  behavior_score: number;
  transaction_risk_score: number;
  contributing_factors: ContributingFactor[];
  why_risky: string[];
  latency_ms?: number;
  speech_active?: boolean;
}

export interface Call {
  id: string;
  caller_phone: string;
  caller_name: string;
  claimed_identity: string;
  channel: string;
  language: string;
  status: string;
  risk_score: number;
  risk_level: RiskLevel;
  duration_seconds: number;
  start_time: string;
}

export interface Transaction {
  id: string;
  call_id?: string;
  amount: number;
  currency: string;
  beneficiary_name: string;
  beneficiary_account: string;
  requested_by: string;
  risk_score: number;
  status: 'PENDING' | 'ON_HOLD' | 'VERIFICATION_REQUIRED' | 'APPROVED' | 'REJECTED';
  notes?: string;
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  transaction_id?: string;
  call_id?: string;
  method: 'SMS_OTP' | 'AUTHENTICATOR' | 'SECURE_CALLBACK' | 'MANAGER_APPROVAL';
  target_contact: string;
  challenge_code: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  risk_before: number;
  risk_after?: number;
  verified_at?: string;
  created_at: string;
}

export interface Incident {
  id: string;
  call_id?: string;
  caller: string;
  claimed_identity: string;
  risk_score: number;
  threat_type: string;
  transaction_id?: string;
  recommended_action: string;
  actual_action: string;
  status: 'OPEN' | 'INVESTIGATING' | 'VERIFIED' | 'BLOCKED' | 'RESOLVED';
  timeline: Array<{ time: string; event: string }>;
  created_at: string;
}

export interface VoiceProfile {
  id: string;
  speaker_name: string;
  role_title: string;
  sample_duration_sec: number;
  is_active: boolean;
  verified_at: string;
  created_at: string;
}

export interface DashboardStats {
  calls_today: number;
  suspicious_calls: number;
  critical_threats: number;
  transactions_protected_amount: number;
  risk_over_time: Array<{ time: string; score: number; baseline: number }>;
  threat_distribution: Array<{ name: string; count: number; color: string }>;
  calls_by_risk_level: Array<{ level: string; count: number; color: string }>;
  recent_events: Array<{
    id: string;
    threat: string;
    score: number;
    risk_level: RiskLevel;
    action: string;
    time: string;
    target: string;
  }>;
}

export type SupportedLanguage = 
  | 'en' // English
  | 'hi' // Hindi
  | 'or' // Odia
  | 'bn' // Bengali
  | 'mr' // Marathi
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'pa' // Punjabi
  | 'gu';// Gujarati
