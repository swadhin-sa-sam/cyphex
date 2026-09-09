import logging
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from app.config import settings
from app.db.models import (
    Base, Organization, User, UserRole, RiskPolicy, 
    VoiceProfile, Call, CallStatus, Transaction, TransactionStatus,
    Incident, IncidentStatus, CallRiskEvent, RiskLevel
)
from app.core.security import get_password_hash

logger = logging.getLogger("voiceshield.db")

# 1. Create engine with resilient Postgres -> SQLite fallback
async def create_resilient_engine():
    try:
        pg_engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            future=True,
            pool_pre_ping=True
        )
        async with pg_engine.connect() as conn:
            pass
        logger.info(f"Connected to primary PostgreSQL database at {settings.DATABASE_URL}")
        return pg_engine
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to local SQLite: {settings.SQLITE_FALLBACK_URL}")
        sqlite_engine = create_async_engine(
            settings.SQLITE_FALLBACK_URL,
            echo=False,
            future=True
        )
        return sqlite_engine

engine = None
async_session = None

def get_engine():
    global engine
    if engine is None:
        try:
            loop = asyncio.get_running_loop()
            engine = create_async_engine(
                settings.DATABASE_URL,
                echo=False,
                future=True,
                pool_pre_ping=True
            )
        except Exception:
            engine = create_async_engine(
                settings.SQLITE_FALLBACK_URL,
                echo=False,
                future=True
            )
    return engine

engine = create_async_engine(
    settings.SQLITE_FALLBACK_URL,
    echo=False,
    future=True
)
async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    global engine, async_session
    try:
        # Try Postgres first
        test_engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            future=True,
            pool_pre_ping=True
        )
        async with test_engine.connect() as conn:
            pass
        engine = test_engine
        logger.info("Using PostgreSQL database.")
    except Exception:
        logger.info("Using SQLite fallback database.")
        engine = create_async_engine(
            settings.SQLITE_FALLBACK_URL,
            echo=False,
            future=True
        )
    
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("VoiceShield database schema verified.")

    # Auto-seed demo data
    async with async_session() as session:
        try:
            res = await session.execute(select(Organization).where(Organization.domain == "demo.com"))
            org = res.scalars().first()
            if not org:
                logger.info("Seeding demo organization and users...")
                org = Organization(
                    id="org-demo-001",
                    name="Apex Global FinTech",
                    domain="demo.com"
                )
                session.add(org)
                await session.flush()

                # Default policy
                policy = RiskPolicy(
                    organization_id=org.id,
                    high_value_threshold=1000000.0, # ₹10,00,000
                    critical_risk_threshold=80.0,
                    high_risk_threshold=60.0,
                    medium_risk_threshold=30.0,
                    weight_synthetic=0.35,
                    weight_speaker=0.25,
                    weight_prosody=0.10,
                    weight_caller=0.10,
                    weight_behavior=0.10,
                    weight_transaction=0.10,
                    audio_retention_days=0
                )
                session.add(policy)

                # Seed Users
                employee = User(
                    id="user-emp-001",
                    organization_id=org.id,
                    email="employee@demo.com",
                    full_name="Priya Sharma (Operations Officer)",
                    hashed_password=get_password_hash("VoiceShieldDemo#2026"),
                    role=UserRole.EMPLOYEE.value
                )
                admin = User(
                    id="user-admin-001",
                    organization_id=org.id,
                    email="admin@demo.com",
                    full_name="Vikramaditya Roy (SOC Director)",
                    hashed_password=get_password_hash("VoiceShieldAdmin#2026"),
                    role=UserRole.ADMIN.value
                )
                cfo = User(
                    id="user-cfo-001",
                    organization_id=org.id,
                    email="cfo@demo.com",
                    full_name="Rajesh Sharma (Chief Financial Officer)",
                    hashed_password=get_password_hash("VoiceShieldCFO#2026"),
                    role=UserRole.MANAGER.value
                )
                session.add_all([employee, admin, cfo])
                await session.flush()

                # Seed Voice Profile for CFO
                # In mock mode, a simulated 192-dim vector string is saved
                cfo_profile = VoiceProfile(
                    id="vp-cfo-001",
                    user_id=cfo.id,
                    organization_id=org.id,
                    speaker_name="Rajesh Sharma",
                    role_title="Chief Financial Officer",
                    voiceprint_encrypted="AES256_GCM_ENCRYPTED_EMBEDDING_VECTOR_RAJESH_SHARMA_CFO_192DIM",
                    sample_duration_sec=12.5,
                    is_active=True
                )
                session.add(cfo_profile)

                # Seed demo sample calls and incidents for the dashboard
                call1 = Call(
                    id="call-sih-001",
                    organization_id=org.id,
                    caller_phone="+91 98200 11223",
                    caller_name="Caller ID: Executive Office",
                    claimed_identity="Rajesh Sharma (CFO)",
                    channel="VoIP",
                    language="en",
                    status=CallStatus.BLOCKED.value,
                    risk_score=94.0,
                    risk_level=RiskLevel.CRITICAL.value,
                    duration_seconds=145
                )
                call2 = Call(
                    id="call-sih-002",
                    organization_id=org.id,
                    caller_phone="+91 98450 44332",
                    caller_name="Supplier Payment Desk",
                    claimed_identity="Vendor Contact",
                    channel="PSTN",
                    language="en",
                    status=CallStatus.VERIFIED.value,
                    risk_score=78.0,
                    risk_level=RiskLevel.HIGH.value,
                    duration_seconds=320
                )
                call3 = Call(
                    id="call-sih-003",
                    organization_id=org.id,
                    caller_phone="+91 98111 88776",
                    caller_name="Retail Support Line",
                    claimed_identity="Unknown Customer",
                    channel="WebRTC",
                    language="hi",
                    status=CallStatus.IN_PROGRESS.value,
                    risk_score=52.0,
                    risk_level=RiskLevel.MEDIUM.value,
                    duration_seconds=85
                )
                session.add_all([call1, call2, call3])
                await session.flush()

                # High risk transaction on call 1
                tx1 = Transaction(
                    id="tx-sih-001",
                    call_id=call1.id,
                    organization_id=org.id,
                    amount=2500000.0, # ₹25,00,000
                    currency="INR",
                    beneficiary_name="ABC Trading Pvt Ltd",
                    beneficiary_account="HDFC000123456789",
                    requested_by="Rajesh Sharma (CFO)",
                    risk_score=94.0,
                    status=TransactionStatus.ON_HOLD.value,
                    notes="Auto-held: High risk voice cloning signature detected."
                )
                session.add(tx1)
                await session.flush()

                # Seed Incidents
                inc1 = Incident(
                    id="VC-28491",
                    call_id=call1.id,
                    organization_id=org.id,
                    caller="+91 98200 11223",
                    claimed_identity="Rajesh Sharma (CFO)",
                    risk_score=94.0,
                    threat_type="Executive Voice Impersonation",
                    transaction_id=tx1.id,
                    recommended_action="BLOCK",
                    actual_action="TRANSACTION_HELD",
                    status=IncidentStatus.BLOCKED.value,
                    timeline=[
                        {"time": "10:14:02", "event": "Incoming VoIP call received from unrecognized trunk"},
                        {"time": "10:14:15", "event": "Caller claimed identity: Rajesh Sharma (CFO)"},
                        {"time": "10:14:28", "event": "Request initiated: ₹25,00,000 wire to ABC Trading Pvt Ltd"},
                        {"time": "10:14:35", "event": "Synthetic voice detected (86%) + Speaker Mismatch (78%)"},
                        {"time": "10:14:38", "event": "High impersonation risk (94/100). Transaction placed ON HOLD automatically."}
                    ]
                )
                inc2 = Incident(
                    id="VC-28489",
                    call_id=call2.id,
                    organization_id=org.id,
                    caller="+91 98450 44332",
                    claimed_identity="Vendor Accounts Payable",
                    risk_score=78.0,
                    threat_type="Vendor Invoice Redirection Attempt",
                    recommended_action="VERIFY",
                    actual_action="SECONDARY_VERIFIED",
                    status=IncidentStatus.VERIFIED.value,
                    timeline=[
                        {"time": "09:32:10", "event": "Call received requesting account details update"},
                        {"time": "09:32:45", "event": "Prosody anomaly detected (72%). Urgency detected."},
                        {"time": "09:33:10", "event": "Secondary callback verification passed with registered vendor."}
                    ]
                )
                session.add_all([inc1, inc2])

                await session.commit()
                logger.info("Demo organization, users, and baseline incidents successfully seeded.")
        except Exception as e:
            await session.rollback()
            logger.error(f"Database seeding error: {e}")
