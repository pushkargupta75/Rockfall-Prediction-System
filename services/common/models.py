from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Site(Base):
    __tablename__ = 'sites'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float)
    description = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    features = relationship("SiteFeature", back_populates="site")
    alert_config = relationship("AlertConfig", back_populates="site", uselist=False)
    alert_history = relationship("AlertHistory", back_populates="site")

class SiteFeature(Base):
    __tablename__ = 'site_features'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String(36), ForeignKey('sites.id'), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    
    # Weather features
    rain_1h_mm = Column(Float)
    rain_24h_mm = Column(Float)
    rain_72h_mm = Column(Float)
    temperature_c = Column(Float)
    humidity_pct = Column(Float)
    
    # Seismic features
    max_magnitude_72h = Column(Float)
    
    # Metadata
    source = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    site = relationship("Site", back_populates="features")

class AlertConfig(Base):
    __tablename__ = 'alert_configs'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String(36), ForeignKey('sites.id'), nullable=False, unique=True)
    threshold = Column(Float, nullable=False, default=0.7)
    email_enabled = Column(Boolean, default=True)
    email_recipients = Column(String(500))  # Comma-separated email addresses
    sms_enabled = Column(Boolean, default=True)
    phone_numbers = Column(String(200))  # Comma-separated phone numbers
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    site = relationship("Site", back_populates="alert_config")

class AlertHistory(Base):
    __tablename__ = 'alert_history'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id = Column(String(36), ForeignKey('sites.id'), nullable=False)
    alert_type = Column(String(50), nullable=False)
    probability = Column(Float)
    risk_level = Column(String(20))
    timestamp = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    site = relationship("Site", back_populates="alert_history")

    prediction = relationship("Prediction")
    site = relationship("Site")
