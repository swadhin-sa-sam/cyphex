import uuid
import time
import json
import os
import numpy as np
import sqlite3
import logging
from cryptography.fernet import Fernet
from dataclasses import dataclass
from app.config import settings

logger = logging.getLogger(__name__)

@dataclass
class EnrolledSpeaker:
    id: str
    name: str
    embedding: np.ndarray
    enrolled_at: float
    metadata: dict

class EnrollmentStore:
    def __init__(self, db_path: str = None, key_file: str = None):
        if db_path:
            self.db_path = db_path.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
        elif "sqlite" in settings.DATABASE_URL:
            self.db_path = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
        else:
            self.db_path = "./cyphex_speakers.db"
        self.key_file = key_file or settings.ENCRYPTION_KEY_FILE
        self._init_encryption()
        self._init_db()

    def _init_encryption(self):
        """Loads or persists a static Fernet key so encrypted embeddings survive server restarts."""
        try:
            if os.path.exists(self.key_file):
                with open(self.key_file, "rb") as f:
                    key = f.read().strip()
                self.fernet = Fernet(key)
            else:
                key = Fernet.generate_key()
                os.makedirs(os.path.dirname(os.path.abspath(self.key_file)), exist_ok=True)
                with open(self.key_file, "wb") as f:
                    f.write(key)
                self.fernet = Fernet(key)
                logger.info(f"Initialized persistent encryption key at {self.key_file}")
        except Exception as e:
            logger.warning(f"Failed to use persistent key file ({e}); falling back to ephemeral in-memory key.")
            self.fernet = Fernet(Fernet.generate_key())

    def _init_db(self):
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS enrolled_speakers (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    encrypted_embedding BLOB NOT NULL,
                    enrolled_at REAL NOT NULL,
                    metadata_json TEXT NOT NULL
                )
            ''')
            conn.commit()

    def add_speaker(self, name: str, embedding: np.ndarray, metadata: dict = None) -> str:
        speaker_id = str(uuid.uuid4())
        emb_clean = np.asarray(embedding, dtype=np.float32).flatten()
        emb_bytes = emb_clean.tobytes()
        encrypted_emb = self.fernet.encrypt(emb_bytes)
        
        meta = metadata or {}
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO enrolled_speakers (id, name, encrypted_embedding, enrolled_at, metadata_json)
                VALUES (?, ?, ?, ?, ?)
            ''', (speaker_id, name, encrypted_emb, time.time(), json.dumps(meta)))
            conn.commit()
            
        logger.info(f"Enrolled speaker {name} ({speaker_id}) successfully.")
        return speaker_id

    def get_speaker(self, speaker_id: str) -> EnrolledSpeaker | None:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, name, encrypted_embedding, enrolled_at, metadata_json FROM enrolled_speakers WHERE id = ?', (speaker_id,))
            row = cursor.fetchone()
            
            if not row:
                return None
                
            enc_emb = row[2]
            if isinstance(enc_emb, str):
                enc_emb = enc_emb.encode('utf-8')
            try:
                dec_emb_bytes = self.fernet.decrypt(enc_emb)
                embedding = np.frombuffer(dec_emb_bytes, dtype=np.float32)
            except Exception as e:
                logger.error(f"Failed to decrypt embedding for speaker {speaker_id}: {e}")
                return None
            
            return EnrolledSpeaker(
                id=row[0],
                name=row[1],
                embedding=embedding,
                enrolled_at=row[3],
                metadata=json.loads(row[4])
            )

    def list_speakers(self) -> list[EnrolledSpeaker]:
        speakers = []
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM enrolled_speakers ORDER BY enrolled_at DESC')
            for row in cursor.fetchall():
                spk = self.get_speaker(row[0])
                if spk:
                    speakers.append(spk)
        return speakers

    def delete_speaker(self, speaker_id: str) -> bool:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM enrolled_speakers WHERE id = ?', (speaker_id,))
            conn.commit()
            return cursor.rowcount > 0

    def find_closest_speaker(self, embedding: np.ndarray, threshold: float = 0.75) -> tuple[EnrolledSpeaker | None, float]:
        best_match = None
        best_sim = -1.0
        
        target = np.asarray(embedding, dtype=np.float32).flatten()
        norm_target = np.linalg.norm(target)
        if norm_target < 1e-6:
            return None, 0.0
            
        for speaker in self.list_speakers():
            ref = speaker.embedding.flatten()
            norm_ref = np.linalg.norm(ref)
            if norm_ref < 1e-6:
                continue
            sim = float(np.dot(target, ref) / (norm_target * norm_ref))
            if sim > best_sim:
                best_sim = sim
                best_match = speaker
                
        if best_sim >= threshold:
            return best_match, best_sim
        return None, max(0.0, best_sim)

# Global singleton
enrollment_store = EnrollmentStore()
