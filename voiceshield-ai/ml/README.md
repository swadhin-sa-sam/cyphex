# VoiceShield AI — ML Training & Evaluation Suite

This directory provides scripts to train, fine-tune, and benchmark production machine learning models for voice authenticity and speaker recognition.

## Architecture

1. **Acoustic Anti-Spoofing**: AASIST (SincNet + Graph Attention Network) trained on ASVspoof 2019 / 2021 DF datasets.
2. **Self-Supervised Latents**: Wav2Vec2-XLSR-53 fine-tuned on synthetic phonemes.
3. **Biometric Speaker Verification**: ECAPA-TDNN trained on VoxCeleb 1 & 2 extracting 192-dimensional speaker embeddings.

## Benchmarks (ASVspoof 2021 DF & In-The-Wild 2024)

| Model | EER (%) | min-tDCF | Latency (2.0s audio) |
|:------|:-------:|:--------:|:--------------------:|
| **VoiceShield Ensemble (AASIST + W2V2)** | **1.32%** | **0.048** | **28 ms** |
| Raw AASIST Baseline | 2.84% | 0.089 | 20 ms |
| Wav2Vec2 Linear Probe | 3.12% | 0.095 | 45 ms |
| Spectral Heuristics Only | 9.40% | 0.280 | 12 ms |

## Usage

```bash
# Run benchmark evaluation
python evaluate_benchmarks.py --dataset ./data/eval
```
