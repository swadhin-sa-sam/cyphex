export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/stream-detect';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const AUTH_API = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  ME: `${API_BASE_URL}/auth/me`,
};

export const DEMO_API = {
  SCENARIOS: `${API_BASE_URL}/demo/scenarios`,
  AUDIO: (scenarioId: string) => `${API_BASE_URL}/demo/audio/${scenarioId}`,
};

export const SAMPLE_RATE = 16000;
export const CHUNK_SIZE_MS = 250;

export const RISK_LEVELS = {
  LOW: { label: 'Low Risk', color: '#22c55e', threshold: 0.3 },
  MEDIUM: { label: 'Medium Risk', color: '#eab308', threshold: 0.55 },
  HIGH: { label: 'High Risk', color: '#f97316', threshold: 0.7 },
  CRITICAL: { label: 'Critical Risk', color: '#ef4444', threshold: 1.0 },
};

export interface DetectionResult {
  score: number;
  anomaly_flags: string[];
  recommendation: string;
  latency_ms?: number;
  jitter?: number;
  shimmer?: number;
  hnr?: number;
  f0_mean?: number;
  speech_active?: boolean;
}

export interface DemoScenario {
  id: string;
  name: string;
  category: 'DEEPFAKE_ATTACK' | 'VOCODER_ARTIFACT' | 'GENUINE_SPEECH';
  target_persona: string;
  attack_vector: string;
  expected_score: number;
  expected_flags: string[];
  description: string;
}

export interface SocOperator {
  id: number;
  username: string;
  email: string;
  role: string;
}
