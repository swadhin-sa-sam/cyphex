"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-09 21:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('username', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('email', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False, server_default='operator'),
        sa.Column('api_key', sa.String(), nullable=True, unique=True, index=True),
        sa.Column('created_at', sa.Float(), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
    )

    # Sessions table
    op.create_table(
        'sessions',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.String(), nullable=True, index=True),
        sa.Column('created_at', sa.Float(), nullable=False),
        sa.Column('ended_at', sa.Float(), nullable=True),
        sa.Column('profile', sa.String(), server_default='STANDARD'),
        sa.Column('metadata_json', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('risk_summary_json', sa.Text(), nullable=False, server_default='{}'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
    )

    # Alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, primary_key=True),
        sa.Column('session_id', sa.String(), nullable=True, index=True),
        sa.Column('timestamp', sa.Float(), nullable=False),
        sa.Column('risk_score', sa.Float(), nullable=False),
        sa.Column('anomaly_flags_json', sa.Text(), nullable=False),
        sa.Column('recommendation', sa.String(), nullable=False),
        sa.Column('channel', sa.String(), nullable=False),
        sa.Column('delivered', sa.Boolean(), server_default='false'),
    )

    # Enrolled speakers table
    op.create_table(
        'enrolled_speakers_db',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('encrypted_embedding', sa.Text(), nullable=False),
        sa.Column('enrolled_at', sa.Float(), nullable=False),
        sa.Column('metadata_json', sa.Text(), nullable=False, server_default='{}'),
    )

    # Analysis logs table
    op.create_table(
        'analysis_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False, primary_key=True),
        sa.Column('session_id', sa.String(), nullable=True, index=True),
        sa.Column('timestamp', sa.Float(), nullable=False),
        sa.Column('features_hash', sa.String(), nullable=False),
        sa.Column('scores_json', sa.Text(), nullable=False),
    )

    # Demo scenarios table
    op.create_table(
        'demo_scenarios',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('threat_type', sa.String(), nullable=False),
        sa.Column('expected_score', sa.Float(), nullable=False),
        sa.Column('expected_verdict', sa.String(), nullable=False),
        sa.Column('duration_s', sa.Float(), server_default='10.0'),
    )

def downgrade() -> None:
    op.drop_table('demo_scenarios')
    op.drop_table('analysis_logs')
    op.drop_table('enrolled_speakers_db')
    op.drop_table('alerts')
    op.drop_table('sessions')
    op.drop_table('users')
