# VoiceShield AI — API Documentation

Interactive Swagger/OpenAPI documentation is available at `http://localhost:8000/docs`.

## Endpoints Summary

### Authentication & RBAC
- `POST /api/v1/auth/login`: Authenticate user, returns JWT bearer token
- `GET /api/v1/auth/me`: Validate active token and clearance level

### Calls & Audio Streaming
- `POST /api/v1/calls`: Register incoming call session
- `GET /api/v1/calls`: List active and past calls with filters
- `GET /api/v1/calls/{id}`: Detailed call metadata and status
- `GET /api/v1/calls/{id}/risk`: Current risk breakdown and explainable factor points
- `WS /api/v1/calls/{id}/stream`: Real-time streaming WebSocket endpoint receiving 16-bit PCM chunks and emitting continuous telemetry JSON

### Transaction Protection
- `POST /api/v1/transactions`: Register financial transfer request (auto-held if risk &ge; 80)
- `GET /api/v1/transactions`: List pending, held, and approved transactions
- `POST /api/v1/transactions/{id}/approve`: Manually approve cleared transaction
- `POST /api/v1/transactions/{id}/reject`: Void fraudulent transaction

### Secondary Identity Verification
- `POST /api/v1/verification/request`: Dispatch out-of-band challenge (SMS OTP, Push MFA, Callback)
- `POST /api/v1/verification/confirm`: Submit challenge code; on success, drops risk from 91 &rarr; 12 and unholds transactions

### Incidents & Forensics
- `GET /api/v1/incidents`: List escalated high-risk incidents
- `GET /api/v1/incidents/{id}`: Incident forensic timeline and signal breakdown
- `PATCH /api/v1/incidents/{id}/status`: Update incident status (INVESTIGATING, BLOCKED, RESOLVED)

### Voice Biometric Profiles
- `POST /api/v1/voice-profiles`: Enroll VIP speaker voiceprint (AES-256 encrypted vector; raw audio discarded)
- `GET /api/v1/voice-profiles`: List registered executive profiles
- `DELETE /api/v1/voice-profiles/{id}`: Purge voiceprint

### Dashboard & Settings
- `GET /api/v1/dashboard/stats`: Aggregated SOC KPIs and Recharts time-series data
- `GET /api/v1/settings`: Retrieve organization risk policies and retention days
- `PUT /api/v1/settings`: Update thresholds and weights
- `GET /api/v1/demo/scenarios`: Retrieve the 3 demonstration threat scenarios
- `POST /api/v1/demo/reset`: Reset database state to pristine baseline
