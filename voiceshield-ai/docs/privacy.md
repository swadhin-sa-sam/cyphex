# VoiceShield AI — Privacy & Compliance Architecture (DPDP Act 2023)

VoiceShield AI is built from the ground up to comply with the Digital Personal Data Protection (DPDP) Act 2023 and global privacy standards:

## 1. Zero Raw Audio Retention by Default
- **In-Memory Ring Buffering**: Audio chunks exist only in transient RAM circular buffers (`CircularAudioBuffer`) for the 2.0-second sliding inference window.
- **Immediate Discard**: Once feature vectors (MFCCs, spectral moments, F0) are computed, the raw PCM audio bytes are immediately freed from memory.
- **Configurable Retention**: Organizations can configure retention in `/settings/privacy`:
  - `0 days`: No retention (Default)
  - `1 day`: 24-hour forensic buffer
  - `7 days`: Weekly operational audit
  - `30 days`: Extended regulatory compliance

## 2. Cryptographic Biometric Vaulting
- **Irreversible Feature Representation**: Speaker voiceprints are stored as 192-dimensional numerical vectors derived from deep acoustic embeddings. It is mathematically impossible to reconstruct the original speech or words from this embedding.
- **AES-256 GCM Vaulting**: All stored voice embeddings are encrypted at rest using AES-256 GCM.

## 3. Immutable Security Audit Trail
- Extracted risk scores, decisions, and administrative actions are logged in `audit_logs` with SHA-256 non-repudiation integrity verification.
