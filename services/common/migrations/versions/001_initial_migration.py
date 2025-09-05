"""initial_migration

Revision ID: 001
Revises: 
Create Date: 2024-01-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Sites table
    op.create_table(
        'sites',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('location', sa.String(100), nullable=False),
        sa.Column('latitude', sa.Float, nullable=False),
        sa.Column('longitude', sa.Float, nullable=False),
        sa.Column('elevation', sa.Float),
        sa.Column('description', sa.String(500)),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now())
    )
    
    # Site Features table
    op.create_table(
        'site_features',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('site_id', sa.String(36), sa.ForeignKey('sites.id'), nullable=False),
        sa.Column('timestamp', sa.DateTime, nullable=False),
        sa.Column('rain_1h_mm', sa.Float),
        sa.Column('rain_24h_mm', sa.Float),
        sa.Column('rain_72h_mm', sa.Float),
        sa.Column('api_value', sa.Float),
        sa.Column('temperature_c', sa.Float),
        sa.Column('temp_change_6h_c', sa.Float),
        sa.Column('temp_change_24h_c', sa.Float),
        sa.Column('humidity_pct', sa.Float),
        sa.Column('quake_count_72h', sa.Integer),
        sa.Column('max_magnitude_72h', sa.Float),
        sa.Column('weighted_magnitude_72h', sa.Float),
        sa.Column('minutes_since_m3', sa.Integer),
        sa.Column('source', sa.String(50)),
        sa.Column('created_at', sa.DateTime, default=sa.func.now())
    )
    
    # Rockfall Events table
    op.create_table(
        'rockfall_events',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('site_id', sa.String(36), sa.ForeignKey('sites.id'), nullable=False),
        sa.Column('timestamp', sa.DateTime, nullable=False),
        sa.Column('volume_m3', sa.Float),
        sa.Column('impact_energy', sa.Float),
        sa.Column('description', sa.String(500)),
        sa.Column('verification_status', sa.String(20)),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now())
    )
    
    # Alert Configurations table
    op.create_table(
        'alert_configs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('site_id', sa.String(36), sa.ForeignKey('sites.id'), nullable=False, unique=True),
        sa.Column('threshold', sa.Float, nullable=False, default=0.7),
        sa.Column('email_enabled', sa.Boolean, default=True),
        sa.Column('email_recipients', postgresql.JSONB),
        sa.Column('sms_enabled', sa.Boolean, default=True),
        sa.Column('phone_numbers', postgresql.JSONB),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now())
    )
    
    # Alert History table
    op.create_table(
        'alert_history',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('site_id', sa.String(36), sa.ForeignKey('sites.id'), nullable=False),
        sa.Column('alert_type', sa.String(50), nullable=False),
        sa.Column('probability', sa.Float),
        sa.Column('risk_level', sa.String(20)),
        sa.Column('timestamp', sa.DateTime, nullable=False),
        sa.Column('created_at', sa.DateTime, default=sa.func.now())
    )
    
    # Create indices
    op.create_index('idx_site_features_site_id_timestamp', 'site_features', ['site_id', 'timestamp'])
    op.create_index('idx_rockfall_events_site_id_timestamp', 'rockfall_events', ['site_id', 'timestamp'])
    op.create_index('idx_alert_history_site_id_timestamp', 'alert_history', ['site_id', 'timestamp'])

def downgrade():
    op.drop_table('alert_history')
    op.drop_table('alert_configs')
    op.drop_table('rockfall_events')
    op.drop_table('site_features')
    op.drop_table('sites')
