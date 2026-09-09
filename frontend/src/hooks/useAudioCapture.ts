import { useState, useRef, useCallback, useEffect } from 'react';
import { SAMPLE_RATE, CHUNK_SIZE_MS } from '../utils/constants';

/**
 * Resamples Float32 audio buffer to target sample rate using linear interpolation.
 */
function resampleBuffer(input: Float32Array, inputRate: number, targetRate: number): Float32Array {
  if (inputRate === targetRate || input.length === 0) {
    return input;
  }
  const ratio = inputRate / targetRate;
  const outputLength = Math.round(input.length / ratio);
  const output = new Float32Array(outputLength);
  
  for (let i = 0; i < outputLength; i++) {
    const origin = i * ratio;
    const index = Math.floor(origin);
    const decimal = origin - index;
    const nextIndex = Math.min(index + 1, input.length - 1);
    output[i] = input[index] * (1.0 - decimal) + input[nextIndex] * decimal;
  }
  return output;
}

/**
 * Converts Float32 array (-1.0 to 1.0) into 16-bit signed integer PCM ArrayBuffer.
 */
function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1.0, Math.min(1.0, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // Little-endian
  }
  return buffer;
}

export function useAudioCapture(onChunk: (pcmBytes: ArrayBuffer, rawData: Float32Array) => void) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | AudioWorkletNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const onChunkRef = useRef(onChunk);

  useEffect(() => {
    onChunkRef.current = onChunk;
  }, [onChunk]);

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });
      mediaStreamRef.current = stream;

      // Initialize AudioContext (let browser choose native sample rate, then resample cleanly to 16kHz)
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioCtxClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      const nativeRate = audioContext.sampleRate;
      const targetChunkSamples = Math.floor(SAMPLE_RATE * (CHUNK_SIZE_MS / 1000.0)); // 4000 samples @ 16kHz
      let pcmAccumulator: number[] = [];

      // Use ScriptProcessorNode with fallback for 100% universal browser support
      const bufferSize = 4096;
      const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);

      scriptProcessor.onaudioprocess = (e) => {
        const inputChannelData = e.inputBuffer.getChannelData(0);

        // 1. Calculate RMS Level for visual meter
        let sum = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          sum += inputChannelData[i] * inputChannelData[i];
        }
        const rms = Math.sqrt(sum / inputChannelData.length);
        setAudioLevel(Math.min(1.0, rms * 7.5));

        // 2. Resample from hardware rate (e.g. 44.1k/48k) to 16,000 Hz
        const resampled = resampleBuffer(inputChannelData, nativeRate, SAMPLE_RATE);

        for (let i = 0; i < resampled.length; i++) {
          pcmAccumulator.push(resampled[i]);
        }

        // 3. Emit exact 250ms chunks (4000 samples)
        while (pcmAccumulator.length >= targetChunkSamples) {
          const chunkData = new Float32Array(pcmAccumulator.slice(0, targetChunkSamples));
          pcmAccumulator = pcmAccumulator.slice(targetChunkSamples);

          const pcmBuffer = floatTo16BitPCM(chunkData);
          onChunkRef.current(pcmBuffer, chunkData);
        }
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      processorRef.current = scriptProcessor;

      setIsCapturing(true);
    } catch (err) {
      console.error('Failed to initialize audio capture:', err);
      setIsCapturing(false);
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCapturing(false);
    setAudioLevel(0);
  }, []);

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return { isCapturing, startCapture, stopCapture, audioLevel };
}
