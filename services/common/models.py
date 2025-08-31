from sqlalchemy import create_engine, Column, String, DateTime, Float, Integer, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

Base = declarative_base()

class Site(Base):
    __tablename__ = "sites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float)
    slope_angle_deg = Column(Float)
    rock_strength_mpa = Column(Float)
    geology_type = Column(String)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), onupdate=datetime.utcnow)

    predictions = relationship("Prediction", back_populates="site")
    features = relationship("SiteFeature", back_populates="site")

class SiteFeature(Base):
    __tablename__ = "site_features"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey('sites.id'))
    timestamp = Column(DateTime(timezone=True), nullable=False)
    
    # Weather features
    rain_1h_mm = Column(Float)
    rain_24h_mm = Column(Float)
    rain_72h_mm = Column(Float)
    api_value = Column(Float)
    temperature_c = Column(Float)
    temp_change_6h_c = Column(Float)
    temp_change_24h_c = Column(Float)
    humidity_pct = Column(Float)

    # Seismic features
    quake_count_72h = Column(Integer)
    max_magnitude_72h = Column(Float)
    weighted_magnitude_72h = Column(Float)
    minutes_since_m3 = Column(Integer)

    # Time features
    month = Column(Integer)
    day_sin = Column(Float)
    day_cos = Column(Float)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    site = relationship("Site", back_populates="features")

class Model(Base):
    __tablename__ = "models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    type = Column(String, nullable=False)  # custom or huggingface
    trained_at = Column(DateTime(timezone=True), nullable=False)
    metrics = Column(JSONB, nullable=False)  # Training metrics
    parameters = Column(JSONB, nullable=False)  # Model parameters
    feature_columns = Column(JSON)  # List of feature columns
    file_path = Column(String, nullable=False)  # Path to saved model
    status = Column(Enum('active', 'inactive', 'archived', name='model_status'))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey('sites.id'))
    model_id = Column(UUID(as_uuid=True), ForeignKey('models.id'))
    timestamp = Column(DateTime(timezone=True), nullable=False)
    probability = Column(Float, nullable=False)
    risk_level = Column(
        Enum('LOW', 'MEDIUM', 'HIGH', name='risk_level'),
        nullable=False
    )
    features_snapshot = Column(JSONB, nullable=False)
    inference_time_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    site = relationship("Site", back_populates="predictions")
    model = relationship("Model")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prediction_id = Column(UUID(as_uuid=True), ForeignKey('predictions.id'))
    site_id = Column(UUID(as_uuid=True), ForeignKey('sites.id'))
    risk_level = Column(Enum('LOW', 'MEDIUM', 'HIGH', name='risk_level'))
    status = Column(
        Enum('pending', 'sent', 'error', name='alert_status'),
        nullable=False
    )
    channels = Column(JSON)  # List of notification channels
    sent_at = Column(DateTime(timezone=True))
    error_message = Column(String)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    prediction = relationship("Prediction")
    site = relationship("Site")
