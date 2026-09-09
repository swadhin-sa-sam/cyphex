# VoiceShield AI — AI & Audio Processing Pipeline

## Audio Specifications
- **Sampling Rate**: 16,000 Hz (16 kHz) Mono
- **Encoding**: 16-bit Little-Endian Linear PCM
- **Chunk Size**: 250ms (4,000 samples)
- **Inference Window**: 2.0s sliding circular buffer (32,000 samples)

## Feature Extraction (`AudioFeatureExtractor`)

VoiceShield extracts 10 core acoustic and temporal dimensions without duplicating logic:

1. **Spectral Centroid**: Center of mass of the frequency spectrum; synthetic voices often display unnatural high-frequency energy drops.
2. **Spectral Bandwidth**: Variance of spectral frequencies around the centroid.
3. **Spectral Rolloff**: Frequency below which 85% of total spectral power lies.
4. **High-Frequency Void (>7.2 kHz)**: Diffusion vocoders (HiFi-GAN, WaveGlow) exhibit characteristic spectral energy dropoffs above 7.2 kHz when operating at downsampled rates.
5. **Zero Crossing Rate (ZCR)**: Rate of sign changes per frame.
6. **RMS Energy Envelope**: Short-term frame energy used for voice activity and intensity.
7. **Fundamental Pitch (F0)**: Normalized autocorrelation tracking pitch contour.
8. **Relative Jitter**: Period-to-period fundamental frequency perturbation. Human speech naturally exhibits 0.4%–1.8% micro-jitter; neural speech is often unnaturally flat (<0.3%) or displays unphysical octave jumps.
9. **Relative Shimmer**: Cycle-to-cycle amplitude perturbation.
10. **Speaking Rate & Pause Ratio**: Detects synthetic pacing and lack of natural human breathing pauses.

## Modality Ensembles

- **AASIST**: SincNet frontend directly processing raw waveform graphs to detect phase anomalies from Mel-inversion.
- **Wav2Vec2-XLSR-53**: Extracts self-supervised acoustic representations to identify phonemic boundary inconsistencies.
- **ECAPA-TDNN**: Generates 192-dimensional embeddings for 1:1 biometric speaker comparison via cosine similarity.
