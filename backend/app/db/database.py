import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

logger = logging.getLogger("cyphex.database")

Base = declarative_base()

# Attempt primary database (PostgreSQL asyncpg); fallback to SQLite aiosqlite if unreachable
primary_url = settings.DATABASE_URL
fallback_url = settings.SQLITE_FALLBACK_URL

try:
    engine = create_async_engine(
        primary_url,
        echo=False,
        pool_pre_ping=True,
    )
except Exception as e:
    logger.warning(f"Failed to create primary engine ({primary_url}): {e}. Falling back to {fallback_url}")
    engine = create_async_engine(fallback_url, echo=False)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """
    Ensures all database schemas are created and seeds initial SOC admin account.
    """
    global engine, SessionLocal
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.warning(f"Primary database connection failed ({e}). Re-binding to SQLite fallback: {fallback_url}")
        engine = create_async_engine(fallback_url, echo=False)
        SessionLocal = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("SQLite fallback schema initialized successfully.")

    # Seed initial admin user if not exists
    from app.db.models import User
    from app.core.security import get_password_hash
    from sqlalchemy import select
    import time
    import uuid

    try:
        async with SessionLocal() as db:
            stmt = select(User).where(User.username == settings.DEFAULT_ADMIN_USERNAME)
            result = await db.execute(stmt)
            existing = result.scalar_one_or_none()
            if not existing:
                admin_user = User(
                    id="usr_" + uuid.uuid4().hex[:12],
                    username=settings.DEFAULT_ADMIN_USERNAME,
                    email="admin@cyphex.ai",
                    hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                    role="admin",
                    api_key="cyphex_live_" + uuid.uuid4().hex,
                    created_at=time.time(),
                    is_active=True
                )
                db.add(admin_user)
                await db.commit()
                logger.info(f"Seeded default SOC admin user: {settings.DEFAULT_ADMIN_USERNAME}")
    except Exception as e:
        logger.error(f"Failed to seed admin user: {e}")

