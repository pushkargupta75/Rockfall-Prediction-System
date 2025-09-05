from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import uvicorn
import smtplib
from email.mime.text import MIMEText
from datetime import datetime
import logging
import os

from services.common.database import get_db
from services.common.models import Site, AlertConfig, AlertHistory

app = FastAPI(
    title="Alert Manager Service",
    description="Service for managing rockfall alerts and notifications",
    version="1.0.0"
)

logger = logging.getLogger(__name__)

class AlertManager:
    def __init__(self):
        # Email configuration
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        
    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Send an email alert"""
        if not all([self.smtp_username, self.smtp_password]):
            logger.warning("Email credentials not configured")
            return False
            
        try:
            msg = MIMEText(body)
            msg['Subject'] = subject
            msg['From'] = self.smtp_username
            msg['To'] = to_email
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
                
            logger.info(f"Email sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
            
    def format_alert_message(self, site_name: str, prediction: dict) -> dict:
        """Format alert messages"""
        timestamp = datetime.fromisoformat(prediction['timestamp'])
        formatted_time = timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")
        probability = prediction['probability'] * 100
        
        subject = f"Rockfall Risk Alert - {site_name}"
        body = f"""
        Rockfall Risk Alert for {site_name}
        
        Time: {formatted_time}
        Risk Level: {prediction['risk_level'].upper()}
        Probability: {probability:.1f}%
        
        Please take necessary precautions.
        """
        
        return {
            'subject': subject,
            'body': body.strip()
        }

alert_manager = AlertManager()

@app.get("/")
async def root():
    return {"message": "Alert Manager Service"}

@app.post("/alerts/{site_id}")
async def process_alert(
    site_id: str,
    prediction: dict,
    db: Session = Depends(get_db)
):
    """Process alert for a site based on prediction"""
    # Get site and config
    site = db.query(Site).filter(Site.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
        
    alert_config = db.query(AlertConfig).filter(
        AlertConfig.site_id == site_id
    ).first()
    
    if not alert_config:
        logger.warning(f"No alert configuration found for site {site_id}")
        return {"message": "No alert configuration found"}
        
    # Check if alert threshold is exceeded
    if prediction['probability'] >= alert_config.threshold:
        # Format messages
        messages = alert_manager.format_alert_message(site.name, prediction)
        alert_sent = False
        
        # Send email alerts
        if alert_config.email_enabled and alert_config.email_recipients:
            for email in alert_config.email_recipients.split(','):
                if alert_manager.send_email(
                    email.strip(),
                    messages['subject'],
                    messages['body']
                ):
                    alert_sent = True
        
        if alert_sent:
            # Log alert
            alert_history = AlertHistory(
                site_id=site_id,
                alert_type='risk_threshold',
                probability=prediction['probability'],
                risk_level=prediction['risk_level'],
                timestamp=datetime.fromisoformat(prediction['timestamp'])
            )
            db.add(alert_history)
            
            try:
                db.commit()
                return {"message": "Alert processed and sent successfully"}
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to log alert: {str(e)}"
                )
                
        return {"message": "No alerts were sent"}
        
    return {"message": "Alert threshold not exceeded"}

def main():
    uvicorn.run(app, host="0.0.0.0", port=8002)

if __name__ == "__main__":
    main()
