import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from services.common.config import get_settings
from services.common.database import get_db
from services.common.models import Site, SiteFeature
from obspy.clients.fdsn import Client
from obspy import UTCDateTime

settings = get_settings()
logger = logging.getLogger(__name__)

class SeismicCollector:
    def __init__(self):
        # Initialize FDSN client for seismic data
        self.client = Client("IRIS")  # IRIS is a major seismic data provider
        self.max_radius_km = 100  # Maximum radius to look for seismic events

    def get_seismic_events(self, lat: float, lon: float, hours: int = 72) -> List[Dict[str, Any]]:
        """Fetch seismic events within radius of a location"""
        try:
            end_time = UTCDateTime()
            start_time = end_time - hours * 3600  # Convert hours to seconds
            
            # Convert radius from km to degrees (approximate)
            radius_degrees = self.max_radius_km / 111.0
            
            # Get catalog of events
            events = self.client.get_events(
                starttime=start_time,
                endtime=end_time,
                latitude=lat,
                longitude=lon,
                maxradius=radius_degrees,
                minmagnitude=1.0  # Minimum magnitude to consider
            )
            
            return [
                {
                    "time": event.origins[0].time.datetime,
                    "magnitude": event.magnitudes[0].mag,
                    "distance_km": self.calculate_distance(
                        lat, lon,
                        event.origins[0].latitude,
                        event.origins[0].longitude
                    )
                }
                for event in events
            ]
            
        except Exception as e:
            logger.error(f"Error fetching seismic data: {str(e)}")
            raise

    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in kilometers"""
        from math import sin, cos, sqrt, atan2, radians
        
        R = 6371.0  # Earth's radius in kilometers
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c

    def calculate_seismic_features(self, events: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate seismic features from events"""
        if not events:
            return {
                "quake_count_72h": 0,
                "max_magnitude_72h": 0.0,
                "weighted_magnitude_72h": 0.0,
                "minutes_since_m3": float('inf')
            }
        
        # Convert to DataFrame for easier analysis
        df = pd.DataFrame(events)
        
        # Calculate time since last significant earthquake (M3+)
        now = datetime.now(timezone.utc)
        m3_events = df[df['magnitude'] >= 3.0]
        minutes_since_m3 = float('inf')
        if not m3_events.empty:
            last_m3 = m3_events['time'].max()
            minutes_since_m3 = (now - last_m3).total_seconds() / 60
        
        # Calculate weighted magnitude
        # Events are weighted by recency and proximity
        df['hours_ago'] = df['time'].apply(lambda x: (now - x).total_seconds() / 3600)
        df['time_weight'] = 1 / (df['hours_ago'] + 1)  # More recent = higher weight
        df['distance_weight'] = 1 / (df['distance_km'] + 1)  # Closer = higher weight
        df['weighted_magnitude'] = (
            df['magnitude'] * 
            df['time_weight'] * 
            df['distance_weight']
        )
        
        return {
            "quake_count_72h": len(df),
            "max_magnitude_72h": float(df['magnitude'].max()),
            "weighted_magnitude_72h": float(df['weighted_magnitude'].sum()),
            "minutes_since_m3": float(minutes_since_m3)
        }

    def update_site_features(self, site_id: str, seismic_features: Dict[str, float]):
        """Update site features with seismic data"""
        with get_db() as db:
            feature = SiteFeature(
                site_id=site_id,
                timestamp=datetime.now(timezone.utc),
                **seismic_features
            )
            
            db.add(feature)
            db.commit()

    def collect_all_sites(self):
        """Collect seismic data for all active sites"""
        with get_db() as db:
            sites = db.query(Site).filter(Site.is_active == True).all()
            
            for site in sites:
                try:
                    # Get seismic events
                    events = self.get_seismic_events(
                        site.latitude,
                        site.longitude
                    )
                    
                    # Calculate features
                    features = self.calculate_seismic_features(events)
                    
                    # Update database
                    self.update_site_features(str(site.id), features)
                    
                    logger.info(f"Seismic data collected for site {site.name}")
                    
                except Exception as e:
                    logger.error(f"Failed to collect seismic data for site {site.name}", 
                               extra={"site_id": site.id, "error": str(e)})

def main():
    collector = SeismicCollector()
    collector.collect_all_sites()

if __name__ == "__main__":
    main()
