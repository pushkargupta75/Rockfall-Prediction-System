import requests
import schedule
import time
from datetime import datetime, timedelta
import logging
import os
import random
from services.common.database import get_db
from services.common.models import Site, SiteFeature

logger = logging.getLogger(__name__)

def collect_weather_data(site_id: str) -> dict:
    """
    Simulate weather data collection
    In a real system, this would call a weather API
    """
    return {
        'rain_1h_mm': random.uniform(0, 10),
        'rain_24h_mm': random.uniform(0, 50),
        'rain_72h_mm': random.uniform(0, 100),
        'temperature_c': random.uniform(10, 30),
        'humidity_pct': random.uniform(40, 100)
    }

def collect_seismic_data(site_id: str) -> dict:
    """
    Simulate seismic data collection
    In a real system, this would call a seismic data API
    """
    return {
        'max_magnitude_72h': random.uniform(0, 4.0)
    }

def collect_site_data():
    """Collect data for all active sites"""
    logger.info("Starting data collection...")
    
    with get_db() as db:
        # Get all active sites
        sites = db.query(Site).filter(Site.is_active == True).all()
        
        for site in sites:
            try:
                # Collect data
                weather_data = collect_weather_data(site.id)
                seismic_data = collect_seismic_data(site.id)
                
                # Create feature record
                feature = SiteFeature(
                    site_id=site.id,
                    timestamp=datetime.utcnow(),
                    source='simulator',
                    **weather_data,
                    **seismic_data
                )
                
                db.add(feature)
                db.commit()
                
                logger.info(f"Data collected for site {site.name}")
                
                # Call prediction service
                try:
                    prediction_url = f"http://localhost:8001/predict/{site.id}"
                    prediction_response = requests.get(prediction_url)
                    
                    if prediction_response.status_code == 200:
                        prediction = prediction_response.json()
                        
                        # Call alert manager if prediction received
                        alert_url = f"http://localhost:8002/alerts/{site.id}"
                        alert_response = requests.post(alert_url, json=prediction)
                        
                        if alert_response.status_code == 200:
                            logger.info(f"Alert processed for site {site.name}")
                        else:
                            logger.error(f"Failed to process alert for site {site.name}")
                            
                    else:
                        logger.error(f"Failed to get prediction for site {site.name}")
                        
                except Exception as e:
                    logger.error(f"Failed to process prediction/alert: {str(e)}")
                
            except Exception as e:
                logger.error(f"Failed to collect data for site {site.name}: {str(e)}")
                continue

def main():
    # Schedule data collection every 5 minutes
    schedule.every(5).minutes.do(collect_site_data)
    
    # Do an initial collection
    collect_site_data()
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main()
