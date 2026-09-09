# VoiceShield AI — Risk Engine & Mathematical Formulation

## 1. Weighted Score Formula

The total dynamic risk score $R \in [0, 100]$ is computed as a weighted fusion of 6 distinct detection layers:

$$R_{\text{raw}} = \sum_{i=1}^{6} w_i \cdot s_i$$

Where weights satisfy $\sum w_i = 1.0$:

| Signal Layer | Component ($s_i$) | Default Weight ($w_i$) | Rationale |
|:-------------|:-----------------|:----------------------:|:----------|
| **Synthetic Speech Detection** | $s_{\text{synth}} \in [0, 100]$ | **35%** | Primary indicator of neural vocoder artifacts |
| **Speaker Biometric Mismatch** | $(1 - s_{\text{match}}) \cdot 100$ | **25%** | Verifies caller against enrolled VIP voiceprint |
| **Prosodic Biomarkers** | $s_{\text{prosody}} \in [0, 100]$ | **10%** | Micro-jitter & pitch step variance |
| **Caller Lineage Anomaly** | $s_{\text{caller}} \in [0, 100]$ | **10%** | Telecom trunk & directory mismatch |
| **Behavioral Social Engineering** | $s_{\text{behavior}} \in [0, 100]$ | **10%** | Urgency, secrecy, bypass keyword cues |
| **Transaction Context** | $s_{\text{transaction}} \in [0, 100]$ | **10%** | High-value threshold & new beneficiary |

## 2. Temporal Smoothing (EMA)

To prevent transient noise flickers between consecutive 250ms chunks, scores are smoothed using an Exponential Moving Average:

$$R_t = \alpha \cdot R_{\text{raw}} + (1 - \alpha) \cdot R_{t-1}, \quad \text{where } \alpha = 0.30$$

## 3. Decision Policy Tiers

| Score Range | Risk Level | Automatic System Action |
|:-----------:|:----------:|:------------------------|
| **0 – 29** | **LOW** | Continue / Allow transaction without friction |
| **30 – 59** | **MEDIUM** | Monitor session & log background telemetry |
| **60 – 79** | **HIGH** | Mandate secondary out-of-band identity verification |
| **80 – 100** | **CRITICAL** | **Block sensitive action & place transaction ON HOLD** |

## 4. Mandatory Fail-Safe Posture

If the voice analysis engine encounters an error, missing model, or network disruption, VoiceShield adheres to strict fail-safe security:
- **Never grant unverified trust**: The system will NOT declare the caller genuine.
- **Fail-Safe Alert**: Returns: `"Voice analysis unavailable. Secondary verification is recommended before performing sensitive actions."`
- **Default Elevated Posture**: Defaults to Risk 65 (HIGH) until secondary verification is established.
