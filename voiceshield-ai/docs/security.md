# VoiceShield AI — Security & Threat Model

## 1. Authentication & Role-Based Access Control (RBAC)

VoiceShield AI implements strict role-based authorization:

| Role | Permissions |
|:-----|:------------|
| `EMPLOYEE` | Monitor incoming calls, review assigned transactions, trigger out-of-band identity verification challenges |
| `MANAGER` | Review held transactions, approve cleared transactions, review operational logs |
| `SECURITY_ANALYST` | Inspect forensic incidents, review telemetry signals, investigate call recordings (if enabled), update incident statuses |
| `ADMIN` | Manage organization policies, enroll VIP voice profiles, configure risk thresholds and weights, rotate security keys |

- **Password Hashing**: PBKDF2-HMAC-SHA256 with 100,000 iterations and per-user cryptographic salt.
- **Session Tokens**: JWT bearer tokens signed with HMAC-SHA256 with 24-hour expiration.
- **WebSocket Authentication**: Secure token handshake before audio streaming begins.

## 2. Threat Vector Mitigations

1. **Diffusion Vocoder Cloning (HiFi-GAN, WaveGlow)**:
   - *Attack*: Threat actor clones executive voice from 3s reference audio.
   - *Mitigation*: AASIST SincNet detects phase artifacts from Mel-spectrogram inversion; spectral heuristics flag unnatural >7.2 kHz dropoffs.
2. **Replay & Soundboard Attacks**:
   - *Attack*: Pre-recorded legitimate voice clips injected into call.
   - *Mitigation*: Sub-band spectral flux and room impulse response (RIR) modeling detect playback loudspeaker acoustics.
3. **High-Pressure Social Engineering**:
   - *Attack*: Urgent requests to wire funds before financial clearing cutoff.
   - *Mitigation*: NLP linguistic analyzer detects urgency, secrecy, and bypass keywords, automatically raising the risk score.
4. **Automated Circuit Breaker**:
   - *Attack*: Employee coerced into pressing transfer button.
   - *Mitigation*: Platform automatically places any transaction &ge; 80 risk into `ON_HOLD`, requiring out-of-band verification.
