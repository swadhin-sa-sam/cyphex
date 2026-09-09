from sqlalchemy import Column, String, Float, Boolean, Text, Integer
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="operator")  # admin, operator, auditor
    api_key = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    created_at = Column(Float, nullable=False)
    ended_at = Column(Float, nullable=True)
    profile = Column(String, default="STANDARD")
    metadata_json = Column(Text, nullable=False, default="{}")
    risk_summary_json = Column(Text, nullable=False, default="{}")
    is_active = Column(Boolean, default=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String, index=True)
    timestamp = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    anomaly_flags_json = Column(Text, nullable=False)
    recommendation = Column(String, nullable=False)
    channel = Column(String, nullable=False)
    delivered = Column(Boolean, default=False)

class EnrolledSpeaker(Base):
    __tablename__ = "enrolled_speakers_db"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    encrypted_embedding = Column(Text, nullable=False)
    enrolled_at = Column(Float, nullable=False)
    metadata_json = Column(Text, nullable=False, default="{}")

class AnalysisLog(Base):
    __tablename__ = "analysis_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String, index=True)
    timestamp = Column(Float, nullable=False)
    features_hash = Column(String, nullable=False)
    scores_json = Column(Text, nullable=False)

class DemoScenario(Base):
    __tablename__ = "demo_scenarios"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    threat_type = Column(String, nullable=False)  # CEO_CLONE, VOCODER_CUTOFF, GENUINE_CALL
    expected_score = Column(Float, nullable=False)
    expected_verdict = Column(String, nullable=False)
    duration_s = Column(Float, default=10.0)

