import threading
import numpy as np

class CircularAudioBuffer:
    """High-performance pre-allocated numpy ring buffer for streaming audio."""

    def __init__(self, window_samples: int):
        self.window_samples = int(window_samples)
        self._buffer = np.zeros(self.window_samples, dtype=np.float32)
        self._write_pos = 0
        self._filled_count = 0
        self.lock = threading.Lock()

    def append(self, chunk: np.ndarray) -> None:
        if chunk is None or len(chunk) == 0:
            return
            
        flat_chunk = np.asarray(chunk, dtype=np.float32).flatten()
        chunk_len = len(flat_chunk)
        
        with self.lock:
            if chunk_len >= self.window_samples:
                # Chunk is larger than or equal to window: keep the latest window_samples
                self._buffer[:] = flat_chunk[-self.window_samples:]
                self._write_pos = 0
                self._filled_count = self.window_samples
                return
                
            end_pos = self._write_pos + chunk_len
            if end_pos <= self.window_samples:
                self._buffer[self._write_pos:end_pos] = flat_chunk
            else:
                first_part = self.window_samples - self._write_pos
                self._buffer[self._write_pos:] = flat_chunk[:first_part]
                self._buffer[:chunk_len - first_part] = flat_chunk[first_part:]
                
            self._write_pos = (self._write_pos + chunk_len) % self.window_samples
            self._filled_count = min(self.window_samples, self._filled_count + chunk_len)

    def get_window(self) -> np.ndarray:
        """Returns the chronological window of up to window_samples."""
        with self.lock:
            if self._filled_count < self.window_samples:
                # Return only what has been accumulated so far in chronological order
                return self._buffer[:self._filled_count].copy()
            
            # Reconstruct chronological window: from write_pos to end, then from 0 to write_pos
            return np.concatenate((
                self._buffer[self._write_pos:],
                self._buffer[:self._write_pos]
            ))

    @property
    def fill_ratio(self) -> float:
        with self.lock:
            return float(self._filled_count) / float(self.window_samples) if self.window_samples > 0 else 0.0

    @property
    def is_ready(self) -> bool:
        with self.lock:
            return self._filled_count >= self.window_samples

    def clear(self) -> None:
        with self.lock:
            self._buffer.fill(0.0)
            self._write_pos = 0
            self._filled_count = 0
