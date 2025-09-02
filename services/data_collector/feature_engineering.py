import numpy as np
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime
from services.common.database import get_db
from services.common.models import SiteFeature
import logging

logger = logging.getLogger(__name__)

class FeatureEngineering:
    def __init__(self):
        self.feature_columns = [
            'rain_1h_mm', 'rain_24h_mm', 'rain_72h_mm',
            'api_value', 'temperature_c', 'temp_change_6h_c',
            'temp_change_24h_c', 'humidity_pct',
            'quake_count_72h', 'max_magnitude_72h',
            'weighted_magnitude_72h', 'minutes_since_m3'
        ]

    def add_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add temporal features like month and time of day"""
        df = df.copy()
        
        # Extract temporal components
        df['month'] = df['timestamp'].dt.month
        
        # Create cyclical time features
        df['day_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.hour / 24.0)
        df['day_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.hour / 24.0)
        
        return df

    def add_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add interaction features between different measurements"""
        df = df.copy()
        
        # Rainfall intensity (mm/hour)
        df['rain_intensity'] = df['rain_1h_mm']
        
        # Temperature-humidity index
        df['temp_humidity_index'] = df['temperature_c'] * df['humidity_pct'] / 100
        
        # Seismic-rainfall interaction
        df['seismic_rain_interaction'] = df['weighted_magnitude_72h'] * df['rain_72h_mm']
        
        return df

    def add_rolling_features(self, df: pd.DataFrame, windows: List[int]) -> pd.DataFrame:
        """Add rolling window features"""
        df = df.copy()
        
        for window in windows:
            suffix = f"{window}h"
            
            # Rolling means
            df[f'temp_mean_{suffix}'] = df['temperature_c'].rolling(window).mean()
            df[f'humidity_mean_{suffix}'] = df['humidity_pct'].rolling(window).mean()
            
            # Rolling standard deviations
            df[f'temp_std_{suffix}'] = df['temperature_c'].rolling(window).std()
            df[f'rain_std_{suffix}'] = df['rain_1h_mm'].rolling(window).std()
            
            # Rolling maxima
            df[f'rain_max_{suffix}'] = df['rain_1h_mm'].rolling(window).max()
            
        return df

    def normalize_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize numerical features"""
        df = df.copy()
        
        for col in self.feature_columns:
            if col in df.columns:
                mean = df[col].mean()
                std = df[col].std()
                if std > 0:
                    df[col] = (df[col] - mean) / std
                
        return df

    def create_feature_vector(self, site_id: str) -> Dict[str, float]:
        """Create feature vector for a site"""
        with get_db() as db:
            # Get recent features
            features = db.query(SiteFeature).filter(
                SiteFeature.site_id == site_id
            ).order_by(
                SiteFeature.timestamp.desc()
            ).limit(72).all()  # Get last 72 hours
            
            if not features:
                raise ValueError(f"No features found for site {site_id}")
            
            # Convert to DataFrame
            df = pd.DataFrame([
                {**f.__dict__, 'timestamp': f.timestamp}
                for f in features
            ])
            
            # Sort by timestamp
            df = df.sort_values('timestamp')
            
            # Add engineered features
            df = self.add_temporal_features(df)
            df = self.add_interaction_features(df)
            df = self.add_rolling_features(df, [6, 12, 24])
            
            # Get latest row with all features
            latest = df.iloc[-1]
            
            # Create feature vector
            feature_vector = {}
            for col in self.feature_columns:
                if col in latest:
                    feature_vector[col] = float(latest[col])
            
            return feature_vector

def main():
    # Example usage
    feature_engineering = FeatureEngineering()
    
    with get_db() as db:
        # Get all active sites
        sites = db.query(Site).filter(Site.is_active == True).all()
        
        for site in sites:
            try:
                features = feature_engineering.create_feature_vector(str(site.id))
                logger.info(f"Created feature vector for site {site.name}")
                
            except Exception as e:
                logger.error(f"Failed to create features for site {site.name}: {str(e)}")

if __name__ == "__main__":
    main()
