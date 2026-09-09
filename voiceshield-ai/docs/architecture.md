# VoiceShield AI — System Architecture & Data Flow

## 1. High-Level Architecture

VoiceShield AI implements an end-to-end defense-in-depth voice integrity verification platform that analyzes live audio streams in real time. Processing continuous **250ms chunks** over a **2.0s circular sliding window**, VoiceShield computes multi-modal acoustic, prosodic, biometric, behavioral, and transactional scores, outputting an authoritative, temporally smoothed risk verdict with **sub-300ms latency**.

```mermaid
flowchart TD
    subgraph Ingestion["1. Capture & Pre-Processing"]
        CALL["Incoming Call (VoIP / PSTN / WebRTC)"] --> CAPTURE["Audio Capture (16 kHz Linear PCM)"]
        CAPTURE --> VAD["Voice Activity Detector (Energy + ZCR)"]
        VAD --> BUFFER["Circular Ring Buffer (2.0s / 32k samples)"]
    end

    subgraph MultiModal["2. Multi-Modal Analysis Ensemble"]
        BUFFER --> FEAT["Unified Feature Extractor (MFCC, Mel, F0, Jitter, Shimmer)"]
        FEAT --> AUTH["Voice Authenticity Service (AASIST + W2V2)"]
        FEAT --> SPK["Speaker Verification Service (192-dim Cosine Similarity)"]
        BUFFER --> BEH["Behavioral Analysis Service (Urgency, Secrecy, Bypass NLP)"]
        BUFFER --> CTX["Context Risk Service (Lineage, ₹ Thresholds, Beneficiary)"]
    end

    subgraph RiskLayer["3. Dynamic Risk Engine"]
        AUTH & SPK & BEH & CTX --> FUSION["Dynamic Weighted Fusion (0 - 100)"]
        FUSION --> EMA["Temporal Smoother (EMA α=0.30)"]
        EMA --> DECISION["Security Decision Policy"]
    end

    subgraph DefenseEnforcement["4. Automated Circuit Breakers"]
        DECISION -->|0 - 29 LOW| ALLOW["Allow Action & Continue"]
        DECISION -->|30 - 59 MEDIUM| MON["Monitor Call Active"]
        DECISION -->|60 - 79 HIGH| SEC["Secondary Verification (MFA)"]
        DECISION -->|80 - 100 CRITICAL| HOLD["Block & Auto-Hold Transaction"]
        HOLD --> INCIDENT["Auto-Log Incident in SOC Registry"]
    end
```

## 2. Core Modules

| Module | Location | Primary Responsibility |
|:-------|:---------|:-----------------------|
| `VoiceAuthenticityService` | `backend/app/services/voice_authenticity.py` | Detects neural vocoder artifacts, diffusion patterns, high-frequency cutoffs |
| `SpeakerVerificationService` | `backend/app/services/speaker_verification.py` | 1:1 cosine distance verification against encrypted VIP voiceprints |
| `BehaviorAnalysisService` | `backend/app/services/behavior_analysis.py` | Detects high-pressure social engineering and policy bypass attempts |
| `ContextRiskService` | `backend/app/services/context_risk.py` | Correlates caller number recognition, transaction values, and beneficiary lineage |
| `RiskEngine` | `backend/app/services/risk_engine.py` | Multi-modal score fusion, EMA smoothing, explainability breakdown, fail-safe posture |
| `TransactionService` | `backend/app/services/transaction_service.py` | Enforces financial circuit breakers: auto-hold when risk &ge; 80 |
| `VerificationService` | `backend/app/services/verification_service.py` | Out-of-band mobile challenge (SMS OTP, Push MFA, Callback) dropping risk |
| `IncidentService` | `backend/app/services/incident_service.py` | Auto-registers security incident records and immutable SOC audit timeline |
