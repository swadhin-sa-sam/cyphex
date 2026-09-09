import numpy as np
from typing import Optional

class CircularAudioBuffer:
    """
    High-performance circular ring buffer for real-time sliding-window audio processing.
    Default capacity: 2.0 seconds at 16,000 Hz = 32,000 samples.
    """
    def __init__(self, capacity_samples: int = 32000):
        self.capacity = capacity_samples
        self.buffer = np.zeros(capacity_samples, dtype=np.float32)
        self.write_pos = 0
        self.total_samples_written = 0

    def append(self, samples: np.ndarray) -> None:
        """
        Append new audio samples (1D float32 array) into circular buffer.
        """
        if len(samples) == 0:
            return

        samples = samples.astype(np.float32)
        num_samples = len(samples)

        if num_samples >= self.capacity:
            # New data completely overwrites buffer
            self.buffer[:] = samples[-self.capacity:]
            self.write_pos = 0
            self.total_samples_written += num_samples
            return

        end_pos = self.write_pos + num_samples
        if end_pos <= self.capacity:
            self.buffer[self.write_pos:end_pos] = samples
        else:
            first_part = self.capacity - self.write_pos
            self.buffer[self.write_pos:] = samples[:first_part]
            self.buffer[:end_pos - self.capacity] = samples[first_part:]

        self.write_pos = (self.write_pos + num_samples) % self.capacity
        self.total_samples_written += num_samples

    def get_window(self) -> np.ndarray:
        """
        Returns chronological audio window in correct time order.
        """
        if self.total_samples_written < self.capacity:
            return self.buffer[:self.write_pos].copy()
        else:
            return np.concatenate((self.buffer[self.write_pos:], self.buffer[:self.write_pos]))

    def clear(self) -> None:
        self.buffer.fill(0.0)
        self.write_pos = 0
        self.total_samples_written = 0

    @property
    def is_full(self) -> bool:
        return self.total_samples_written >= self.capacity
