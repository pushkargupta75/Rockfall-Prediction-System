from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import uvicorn
from datetime import datetime
import logging

from services.common.database import get_db
from services.common.models import Site, SiteFeature

app = FastAPI(
    title="Rockfall Prediction Service",
    description="Service for making rockfall predictions based on site data",
    version="1.0.0"
)

logger = logging.getLogger(__name__)

class SimplePredictor:
    def __init__(self):
        # Simple thresholds for risk assessment
        self.rain_threshold_24h = 25.0  # mm
        self.rain_threshold_72h = 50.0  # mm
        self.quake_magnitude_threshold = 3.0
        self.humidity_threshold = 85.0  # %
        
    def calculate_risk(self, features):
        """Calculate risk based on simple rules"""
        risk_factors = []
        
        # Rainfall risk
        if features.rain_24h_mm and features.rain_24h_mm > self.rain_threshold_24h:
            risk_factors.append(0.6)
        if features.rain_72h_mm and features.rain_72h_mm > self.rain_threshold_72h:
            risk_factors.append(0.8)
            
        # Seismic risk
        if features.max_magnitude_72h and features.max_magnitude_72h >= self.quake_magnitude_threshold:
            risk_factors.append(0.7)
            
        # Environmental conditions
        if features.humidity_pct and features.humidity_pct > self.humidity_threshold:
            risk_factors.append(0.4)
            
        # If no risk factors, return low baseline risk
        if not risk_factors:
            return 0.1
            
        # Combine risk factors (taking maximum as overall risk)
        return min(1.0, max(risk_factors))

predictor = SimplePredictor()

@app.get("/")
async def root():
    return {"message": "Rockfall Prediction Service"}

@app.get("/predict/{site_id}")
async def predict(site_id: str, db: Session = Depends(get_db)):
    """Make prediction for a site"""
    # Get site
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
        
    # Get latest features
    latest_feature = db.query(SiteFeature).filter(
        SiteFeature.site_id == site_id
    ).order_by(
        SiteFeature.timestamp.desc()
    ).first()
    
    if not latest_feature:
        raise HTTPException(status_code=404, detail="No feature data available")
        
    # Calculate risk
    probability = predictor.calculate_risk(latest_feature)
    
    return {
        'site_id': site_id,
        'probability': probability,
        'risk_level': 'high' if probability >= 0.6 else 'low',
        'timestamp': datetime.utcnow().isoformat(),
        'features_used': {
            'rain_24h_mm': latest_feature.rain_24h_mm,
            'rain_72h_mm': latest_feature.rain_72h_mm,
            'max_magnitude_72h': latest_feature.max_magnitude_72h,
            'humidity_pct': latest_feature.humidity_pct
        }
    }

def main():
    uvicorn.run(app, host="0.0.0.0", port=8001)

if __name__ == "__main__":
    main()
