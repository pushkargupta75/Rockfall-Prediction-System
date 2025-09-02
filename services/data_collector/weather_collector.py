import requests
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
import pandas as pd
from services.common.config import get_settings
from services.common.database import get_db
from services.common.models import Site, SiteFeature
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

settings = get_settings()
logger = logging.getLogger(__name__)

class WeatherCollector:
    def __init__(self):
        self.api_key = settings.OWM_API_KEY
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"
        
        # Initialize InfluxDB client
        self.influx_client = InfluxDBClient(
            url=settings.INFLUX_URL,
            token=settings.INFLUX_TOKEN,
            org=settings.INFLUX_ORG
        )
        self.write_api = self.influx_client.write_api(write_options=SYNCHRONOUS)

    def get_weather_data(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch current weather data for a location"""
        try:
            params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key,
                "units": "metric"  # Use metric units
            }
            
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "temperature_c": data["main"]["temp"],
                "humidity_pct": data["main"]["humidity"],
                "rain_1h_mm": data.get("rain", {}).get("1h", 0),
                "pressure_hpa": data["main"]["pressure"],
                "wind_speed_ms": data["wind"]["speed"],
                "wind_direction_deg": data["wind"]["deg"],
                "clouds_pct": data["clouds"]["all"]
            }
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {str(e)}")
            raise

    def calculate_accumulated_rain(self, site_id: str, hours: int) -> float:
        """Calculate accumulated rainfall for a period"""
        query = f'''
        from(bucket: "{settings.INFLUX_BUCKET}")
            |> range(start: -{hours}h)
            |> filter(fn: (r) => r["site_id"] == "{site_id}")
            |> filter(fn: (r) => r["_measurement"] == "weather")
            |> filter(fn: (r) => r["_field"] == "rain_1h_mm")
            |> sum()
        '''
        
        result = self.influx_client.query_api().query(query)
        if result and len(result) > 0 and len(result[0].records) > 0:
            return float(result[0].records[0].get_value())
        return 0.0

    def calculate_temp_change(self, site_id: str, hours: int) -> float:
        """Calculate temperature change over a period"""
        query = f'''
        from(bucket: "{settings.INFLUX_BUCKET}")
            |> range(start: -{hours}h)
            |> filter(fn: (r) => r["site_id"] == "{site_id}")
            |> filter(fn: (r) => r["_measurement"] == "weather")
            |> filter(fn: (r) => r["_field"] == "temperature_c")
            |> first()
        '''
        
        result = self.influx_client.query_api().query(query)
        if result and len(result) > 0 and len(result[0].records) > 0:
            old_temp = float(result[0].records[0].get_value())
            return self.current_temp - old_temp
        return 0.0

    def store_weather_data(self, site_id: str, data: Dict[str, float]):
        """Store weather data in InfluxDB"""
        point = Point("weather")\
            .tag("site_id", site_id)\
            .time(datetime.utcnow())
        
        for field, value in data.items():
            point.field(field, value)
        
        self.write_api.write(
            bucket=settings.INFLUX_BUCKET,
            org=settings.INFLUX_ORG,
            record=point
        )

    def update_site_features(self, site_id: str, weather_data: Dict[str, Any]):
        """Update site features with weather data"""
        with get_db() as db:
            # Calculate derived features
            rain_24h = self.calculate_accumulated_rain(site_id, 24)
            rain_72h = self.calculate_accumulated_rain(site_id, 72)
            temp_change_6h = self.calculate_temp_change(site_id, 6)
            temp_change_24h = self.calculate_temp_change(site_id, 24)
            
            # Create antecedent precipitation index (API)
            api_value = rain_24h * 0.5 + rain_72h * 0.3  # Simple weighted sum
            
            # Create feature record
            feature = SiteFeature(
                site_id=site_id,
                timestamp=datetime.now(timezone.utc),
                rain_1h_mm=weather_data["rain_1h_mm"],
                rain_24h_mm=rain_24h,
                rain_72h_mm=rain_72h,
                api_value=api_value,
                temperature_c=weather_data["temperature_c"],
                temp_change_6h_c=temp_change_6h,
                temp_change_24h_c=temp_change_24h,
                humidity_pct=weather_data["humidity_pct"]
            )
            
            db.add(feature)
            db.commit()

    def collect_all_sites(self):
        """Collect weather data for all active sites"""
        with get_db() as db:
            sites = db.query(Site).filter(Site.is_active == True).all()
            
            for site in sites:
                try:
                    # Get weather data
                    weather_data = self.get_weather_data(
                        site.latitude,
                        site.longitude
                    )
                    
                    # Store in InfluxDB
                    self.store_weather_data(str(site.id), weather_data)
                    
                    # Update site features
                    self.update_site_features(str(site.id), weather_data)
                    
                    logger.info(f"Weather data collected for site {site.name}")
                    
                except Exception as e:
                    logger.error(f"Failed to collect weather data for site {site.name}", 
                               extra={"site_id": site.id, "error": str(e)})

def main():
    collector = WeatherCollector()
    collector.collect_all_sites()

if __name__ == "__main__":
    main()
