# 🛡️ VoiceShield AI
### *Detect. Verify. Protect.*
**Real-Time Voice Integrity & Impersonation-Risk Defense Platform**
*Smart India Hackathon (SIH 2026)*

---

## 📌 Executive Summary

Recent advances in generative AI and neural speech synthesis have made high-fidelity voice cloning possible from only a few seconds of recorded audio. Malicious actors are exploiting these tools to impersonate CXOs, government officials, and trusted individuals to initiate fraudulent financial transactions and bypass authorization procedures.

**VoiceShield AI** is an enterprise-grade defense platform that intercepts live audio streams, analyzes acoustic voice authenticity, verifies biometric speaker identity, assesses linguistic urgency, evaluates caller context, and enforces automated circuit breakers on high-value transactions.

```
Incoming Call
      ↓
Capture Audio (16 kHz PCM)
      ↓
Audio Preprocessing (VAD & Ring Buffer)
      ↓
Voice Authenticity Analysis (AASIST + W2V2)
      ↓
Speaker Verification (192-dim Biometrics)
      ↓
Behavioral Analysis (Urgency & Bypass NLP)
      ↓
Caller / Context Analysis (Lineage & ₹ Limit)
      ↓
Dynamic Risk Score (0 – 100)
      ↓
Security Decision
      ↓
┌──────────┬───────────┬──────────┬──────────┐
│   LOW    │  MEDIUM   │   HIGH   │ CRITICAL │
│ Continue │  Monitor  │  Verify  │   Block  │
└──────────┴───────────┴──────────┴──────────┘
      ↓
Transaction Protection (Auto-Hold ≥ 80)
      ↓
Secondary Verification (Out-of-Band MFA)
      ↓
Audit / Incident Logging
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Organization | Clearance |
|:-----|:------|:---------|:-------------|:----------|
| **Operations Officer** | `employee@demo.com` | `VoiceShieldDemo#2026` | `demo.com` | Level 2 (Call Intercept) |
| **SOC Director (Admin)** | `admin@demo.com` | `VoiceShieldAdmin#2026` | `demo.com` | Level 4 (Full Admin) |
| **CFO** | `cfo@demo.com` | `VoiceShieldCFO#2026` | `demo.com` | Executive Enrolled |

> [!TIP]
> On the login page, you can simply click the **👤 Operations Officer** quick-fill button to authenticate instantly without typing.

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (All Services)
Runs PostgreSQL 16, Redis 7, FastAPI Backend, and Next.js/React Frontend:
```bash
cd voiceshield-ai
docker-compose up --build
```
- **Frontend Console**: `http://localhost:3000`
- **Backend API & Swagger**: `http://localhost:8000/docs`
- **PostgreSQL**: `localhost:5432` (`voiceshield` / `voiceshield`)
- **Redis**: `localhost:6379`

### Option 2: Local Bare-Metal (Zero-Configuration Fallback)
VoiceShield automatically detects local database availability and falls back to a high-performance local SQLite database (`voiceshield.db`) if PostgreSQL is not running:

#### 1. Backend:
```bash
cd voiceshield-ai/backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend:
```bash
cd voiceshield-ai/frontend
npm install
npm run dev
```
Open `http://localhost:3000` or `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests

Run backend unit and integration tests:
```bash
cd voiceshield-ai/backend
pytest tests/ -v
```
Tests verify:
- Dynamic risk weighting and temporal smoothing
- Mandatory fail-safe behavior when voice analysis is unavailable
- Automatic transaction hold at risk &ge; 80
- Secondary MFA verification and risk reduction (91 &rarr; 12)
- Audio feature extraction (MFCCs, spectral centroid, pitch F0, jitter, shimmer)

---

## 📂 Repository Structure

```
voiceshield-ai/
│
├── frontend/                     # React 18 + TypeScript + Tailwind CSS Cyber Console
│   ├── src/
│   │   ├── components/           # RiskScoreCard, LiveWaveform, WhyIsThisRisky, MfaModal, Navbar, Sidebar
│   │   ├── pages/                # All 10 required routes (/dashboard, /calls, /verification, /demo, etc.)
│   │   ├── context/              # AuthContext with 11-language i18n
│   │   └── utils/                # API constants and Indian language translation dictionary
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── backend/                      # Python FastAPI Enterprise Backend
│   ├── app/
│   │   ├── main.py               # Lifespan auto-initializes DB & seeds demo scenarios
│   │   ├── config.py             # Environment settings & fallback URLs
│   │   ├── db/                   # Resilient Postgres + SQLite async engine & 10 SQLAlchemy models
│   │   ├── core/                 # PBKDF2 security, audio feature extraction, VAD, circular buffer
│   │   ├── services/             # Voice authenticity, speaker verification, behavior, risk engine
│   │   ├── schemas/              # Pydantic v2 validation models
│   │   └── api/routes/           # auth, calls, websocket, transactions, verification, incidents, demo
│   ├── tests/                    # Pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml/                           # ML Training, Fine-Tuning & Evaluation Suite
│   └── README.md                 # Benchmarks on ASVspoof 2021 & VoxCeleb
│
├── database/                     # Production Database Assets
│   └── schema.sql                # Complete PostgreSQL 16 DDL
│
├── docs/                         # Comprehensive Documentation
│   ├── architecture.md           # System data flow & component interactions
│   ├── ai-pipeline.md            # Acoustic feature extraction & neural vocoders
│   ├── risk-engine.md            # Mathematical formulation & decision tiers
│   ├── api.md                    # REST & WebSocket specifications
│   ├── database.md               # ER diagram and table schemas
│   ├── privacy.md                # DPDP Act 2023 compliance & zero audio retention
│   ├── security.md               # Threat modeling & RBAC
│   └── demo-script.md            # Step-by-step SIH 2026 presentation walkthrough
│
├── docker-compose.yml            # Multi-container orchestration
├── .env.example                  # Environment configuration template
├── README.md                     # Platform overview & setup
└── .gitignore                    # Git exclusions
```

---

## 🌐 Multilingual UI Support

VoiceShield supports on-the-fly UI language localization across 11 Indian languages:
- **English**, **हिन्दी (Hindi)**, **ଓଡ଼ିଆ (Odia)**, **বাংলা (Bengali)**, **मराठी (Marathi)**, **தமிழ் (Tamil)**, **తెలుగు (Telugu)**, **ಕನ್ನಡ (Kannada)**, **മലയാളം (Malayalam)**, **ਪੰਜਾਬੀ (Punjabi)**, **ગુજરાતી (Gujarati)**.

---

## 🔒 Privacy & Fail-Safe Compliance (DPDP Act 2023)

- **Zero Raw Audio Retention**: Raw voice audio is held only in ephemeral RAM circular buffers for the duration of the 2.0s sliding window and is discarded immediately after acoustic feature extraction.
- **Biometric Encryption**: Speaker voiceprints are stored as irreversible 192-dimensional numerical embeddings vaulted with AES-256 GCM encryption.
- **Mandatory Fail-Safe Mode**: If voice analysis services are disrupted or offline, VoiceShield will **never grant unverified trust**. It automatically sets risk to HIGH (65) and mandates secondary verification.
