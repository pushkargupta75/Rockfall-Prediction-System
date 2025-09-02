from datetime import datetime, timedelta
from typing import Dict, Any
import numpy as np
from services.common.database import get_db
from services.common.models import SiteFeature
import logging

logger = logging.getLogger(__name__)

class SimpleRockfallPredictor:
    def __init__(self):
        # Simple thresholds for risk assessment
        self.rain_threshold_24h = 25.0  # mm
        self.rain_threshold_72h = 50.0  # mm
        self.quake_magnitude_threshold = 3.0
        self.humidity_threshold = 85.0  # %
        
    def calculate_risk(self, features: Dict[str, Any]) -> float:
        """
        Calculate risk based on simple rules and thresholds
        Returns a probability between 0 and 1
        """
        risk_factors = []
        
        # Rainfall risk
        if features['rain_24h_mm'] > self.rain_threshold_24h:
            risk_factors.append(0.6)
        if features['rain_72h_mm'] > self.rain_threshold_72h:
            risk_factors.append(0.8)
            
        # Seismic risk
        if features['max_magnitude_72h'] >= self.quake_magnitude_threshold:
            risk_factors.append(0.7)
            
        # Environmental conditions
        if features['humidity_pct'] > self.humidity_threshold:
            risk_factors.append(0.4)
            
        # If no risk factors, return low baseline risk
        if not risk_factors:
            return 0.1
            
        # Combine risk factors (taking maximum as overall risk)
        return min(1.0, max(risk_factors))
        
    def predict(self, site_id: str) -> Dict[str, Any]:
        """Make prediction for a site based on recent data"""
        with get_db() as db:
            # Get most recent features
            latest_feature = db.query(SiteFeature).filter(
                SiteFeature.site_id == site_id
            ).order_by(
                SiteFeature.timestamp.desc()
            ).first()
            
            if not latest_feature:
                raise ValueError(f"No data available for site {site_id}")
                
            # Calculate risk probability
            features = {
                'rain_24h_mm': latest_feature.rain_24h_mm,
                'rain_72h_mm': latest_feature.rain_72h_mm,
                'max_magnitude_72h': latest_feature.max_magnitude_72h,
                'humidity_pct': latest_feature.humidity_pct
            }
            
            probability = self.calculate_risk(features)
            
            return {
                'site_id': site_id,
                'probability': probability,
                'risk_level': 'high' if probability >= 0.6 else 'low',
                'timestamp': datetime.utcnow().isoformat(),
                'features_used': features
            }

def main():
    # Example usage
    predictor = SimpleRockfallPredictor()
    
    with get_db() as db:
        # Get recent data and make predictions
        try:
            site_id = "test_site_1"  # Replace with actual site ID
            prediction = predictor.predict(site_id)
            logger.info(f"Prediction for site {site_id}: {prediction}")
            
        except Exception as e:
            logger.error(f"Failed to make prediction: {str(e)}")

if __name__ == "__main__":
    main()

settings = get_settings()
logger = setup_logging(__name__)

class PredictionService:
    def __init__(self):
        self.model = None
        self.model_version = None
        self.feature_columns = None
        self._load_latest_model()
    
    def _load_latest_model(self):
        """Load the latest active model"""
        with get_db() as db:
            model_record = db.query(Model).filter(
                Model.status == "active"
            ).order_by(desc(Model.trained_at)).first()
            
            if not model_record:
                raise ValueError("No active model found")
            
            if (self.model_version != model_record.version):
                logger.info(f"Loading model version: {model_record.version}")
                model_artifacts = joblib.load(model_record.file_path)
                self.model = model_artifacts["pipeline"]
                self.feature_columns = model_artifacts["feature_columns"]
                self.model_version = model_record.version
    
    def get_latest_features(self, site_id: str, db) -> Optional[Dict[str, Any]]:
        """Get the latest feature vector for a site"""
        feature_row = db.query(SiteFeature).filter(
            SiteFeature.site_id == site_id
        ).order_by(desc(SiteFeature.timestamp)).first()
        
        if not feature_row:
            return None
        
        # Convert to dictionary and select required features
        features = {
            col: getattr(feature_row, col)
            for col in self.feature_columns
            if hasattr(feature_row, col)
        }
        
        return features
    
    def predict(self, site_id: str) -> Dict[str, Any]:
        """Generate prediction for a site"""
        try:
            # Ensure latest model is loaded
            self._load_latest_model()
            
            with get_db() as db:
                # Get features
                features = self.get_latest_features(site_id, db)
                if not features:
                    raise ValueError(f"No features available for site {site_id}")
                
                # Make prediction
                start_time = datetime.now()
                probability = float(self.model.predict_proba([features])[0, 1])
                inference_time = (datetime.now() - start_time).total_seconds() * 1000
                
                # Determine risk level
                if probability >= settings.PREDICTION_THRESHOLD_HIGH:
                    risk_level = "HIGH"
                elif probability >= settings.PREDICTION_THRESHOLD_MEDIUM:
                    risk_level = "MEDIUM"
                else:
                    risk_level = "LOW"
                
                # Record prediction
                prediction = Prediction(
                    id=uuid.uuid4(),
                    site_id=site_id,
                    model_id=uuid.UUID(self.model_version),
                    timestamp=datetime.now(timezone.utc),
                    probability=probability,
                    risk_level=risk_level,
                    features_snapshot=features,
                    inference_time_ms=inference_time
                )
                
                db.add(prediction)
                db.commit()
                
                return {
                    "id": str(prediction.id),
                    "timestamp": prediction.timestamp,
                    "probability": probability,
                    "risk_level": risk_level,
                    "model_version": self.model_version
                }
                
        except Exception as e:
            logger.error("Error generating prediction", extra={
                "site_id": site_id,
                "error": str(e)
            })
            raise
    
    def predict_all_sites(self):
        """Generate predictions for all active sites"""
        with get_db() as db:
            sites = db.query(Site).filter(Site.is_active == True).all()
            
            for site in sites:
                try:
                    prediction = self.predict(str(site.id))
                    logger.info(f"Generated prediction for site {site.name}", extra={
                        "site_id": site.id,
                        "risk_level": prediction["risk_level"],
                        "probability": prediction["probability"]
                    })
                    
                except Exception as e:
                    logger.error(f"Failed to generate prediction for site {site.name}", 
                               extra={"site_id": site.id, "error": str(e)})

def main():
    # Example usage
    service = PredictionService()
    service.predict_all_sites()

if __name__ == "__main__":
    main()
