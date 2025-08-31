from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from services.common.database import get_db
from services.common.models import Prediction, Site
from services.prediction_service.predictor import PredictionService
from services.common.logging import setup_logger

router = APIRouter(prefix="/api/predictions", tags=["predictions"])
logger = setup_logger("predictions")
predictor = PredictionService()

@router.post("/sites/{site_id}/predict")
async def create_prediction(
    site_id: UUID,
    db: Session = Depends(get_db)
):
    """Generate a new prediction for a site"""
    try:
        prediction = predictor.predict(str(site_id))
        return prediction
    except Exception as e:
        logger.error(f"Failed to generate prediction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate prediction"
        )

@router.get("/{site_id}/latest")
async def get_latest_prediction(
    site_id: UUID,
    db: Session = Depends(get_db)
):
    """Get the latest prediction for a site"""
    prediction = (
        db.query(Prediction)
        .filter(Prediction.site_id == site_id)
        .order_by(Prediction.timestamp.desc())
        .first()
    )
    
    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="No predictions found for this site"
        )
    
    return prediction

@router.get("/{site_id}/history")
async def get_prediction_history(
    site_id: UUID,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Get prediction history for a site"""
    query = db.query(Prediction).filter(Prediction.site_id == site_id)
    
    if start_date:
        query = query.filter(Prediction.timestamp >= start_date)
    if end_date:
        query = query.filter(Prediction.timestamp <= end_date)
    
    predictions = query.order_by(Prediction.timestamp.desc()).all()
    return predictions

@router.get("/sites/{site_id}/stats")
async def get_site_prediction_stats(
    site_id: UUID,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get prediction statistics for a site"""
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    stats = (
        db.query(
            func.count().label("total_predictions"),
            func.avg(Prediction.probability).label("avg_probability"),
            func.count().filter(Prediction.risk_level == "HIGH").label("high_risk_count")
        )
        .filter(
            Prediction.site_id == site_id,
            Prediction.timestamp.between(start_date, end_date)
        )
        .first()
    )
    
    return {
        "period_days": days,
        "total_predictions": stats.total_predictions,
        "average_probability": float(stats.avg_probability) if stats.avg_probability else 0.0,
        "high_risk_count": stats.high_risk_count
    }
