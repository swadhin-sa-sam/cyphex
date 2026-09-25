import uuid
import time
import threading
from dataclasses import dataclass, field
from app.core.audio_buffer import CircularAudioBuffer
from app.config import settings

@dataclass
class Session:
    id: str
    created_at: float
    ended_at: float | None = None
    audio_buffer: CircularAudioBuffer = field(default_factory=lambda: CircularAudioBuffer(settings.WINDOW_SAMPLES))
    score_history: list[float] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)
    risk_level: str = "LOW"
    is_active: bool = True

class SessionManager:
    def __init__(self, max_history: int = 500):
        self._sessions: dict[str, Session] = {}
        self._lock = threading.Lock()
        self._max_history = max_history

    def create_session(self, session_id: str = None, metadata: dict = None) -> Session:
        sid = session_id or f"SES-{uuid.uuid4().hex[:8].upper()}"
        session = Session(
            id=sid,
            created_at=time.time(),
            audio_buffer=CircularAudioBuffer(settings.WINDOW_SAMPLES),
            metadata=metadata or {}
        )
        with self._lock:
            # Purge oldest inactive sessions if exceeding max_history
            if len(self._sessions) >= self._max_history:
                inactive_keys = [k for k, v in self._sessions.items() if not v.is_active]
                if inactive_keys:
                    del self._sessions[inactive_keys[0]]
            self._sessions[sid] = session
        return session

    def get_session(self, session_id: str) -> Session | None:
        with self._lock:
            return self._sessions.get(session_id)

    def end_session(self, session_id: str):
        with self._lock:
            if session_id in self._sessions:
                s = self._sessions[session_id]
                s.is_active = False
                s.ended_at = time.time()
                # Audio buffer can be cleared to release memory while retaining score history
                s.audio_buffer.clear()

# Global singleton instance
session_manager = SessionManager()
