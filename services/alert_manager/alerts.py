from datetime import datetime, timezone, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client
import logging
from typing import Dict, Any
from services.common.config import get_settings
from services.common.database import get_db
from services.common.models import Alert, Prediction, Site

settings = get_settings()
logger = logging.getLogger(__name__)

class AlertManager:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        
        self.twilio_client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )
        self.twilio_from = settings.TWILIO_FROM_NUMBER

    def send_email(self, subject: str, body: str, to_email: str) -> bool:
        """Send email alert"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False

    def send_sms(self, message: str, to_number: str) -> bool:
        """Send SMS alert"""
        try:
            self.twilio_client.messages.create(
                body=message,
                from_=self.twilio_from,
                to=to_number
            )
            return True
            
        except Exception as e:
            logger.error(f"Failed to send SMS: {str(e)}")
            return False

    def format_alert_message(self, prediction: Prediction, site: Site) -> Dict[str, str]:
        """Format alert messages for different channels"""
        risk_level = prediction.risk_level
        prob = f"{prediction.probability * 100:.1f}%"
        
        return {
            "email_subject": f"⚠️ Rockfall Alert: {risk_level} Risk at {site.name}",
            "email_body": f"""
Rockfall Alert System

Site: {site.name}
Risk Level: {risk_level}
Probability: {prob}
Timestamp: {prediction.timestamp}

Location:
- Latitude: {site.latitude}
- Longitude: {site.longitude}
- Elevation: {site.elevation}m

Please take appropriate precautions and monitor the situation.

--
Rockfall Prediction System
""",
            "sms_body": f"🪨 ALERT: {risk_level} rockfall risk ({prob}) detected at {site.name}. Check email for details."
        }

    def should_alert(self, site_id: str, risk_level: str, db) -> bool:
        """Check if alert should be sent based on throttling rules"""
        throttle_minutes = {
            "HIGH": settings.ALERT_THROTTLE_HIGH,
            "MEDIUM": settings.ALERT_THROTTLE_MEDIUM,
            "LOW": 0  # Don't alert for low risk
        }
        
        if risk_level == "LOW":
            return False
            
        cutoff_time = datetime.now(timezone.utc) - timedelta(
            minutes=throttle_minutes[risk_level]
        )
        
        recent_alert = db.query(Alert).filter(
            Alert.site_id == site_id,
            Alert.risk_level == risk_level,
            Alert.created_at >= cutoff_time,
            Alert.status == "sent"
        ).first()
        
        return recent_alert is None

    def process_prediction(self, prediction_id: str):
        """Process a new prediction and send alerts if needed"""
        with get_db() as db:
            try:
                # Get prediction details
                prediction = db.query(Prediction).filter(
                    Prediction.id == prediction_id
                ).first()
                
                if not prediction or prediction.risk_level == "LOW":
                    return
                
                # Get site details
                site = db.query(Site).filter(Site.id == prediction.site_id).first()
                
                if not site:
                    logger.error(f"Site not found for prediction {prediction_id}")
                    return
                
                # Check throttling
                if not self.should_alert(site.id, prediction.risk_level, db):
                    logger.info(f"Alert throttled for {site.name}")
                    return
                
                # Create alert record
                alert = Alert(
                    prediction_id=prediction.id,
                    site_id=site.id,
                    risk_level=prediction.risk_level,
                    status="pending",
                    channels=["email", "sms"]
                )
                db.add(alert)
                db.commit()
                
                try:
                    # Format messages
                    messages = self.format_alert_message(prediction, site)
                    
                    # Send alerts
                    email_success = self.send_email(
                        messages["email_subject"],
                        messages["email_body"],
                        site.contact_email
                    )
                    
                    sms_success = self.send_sms(
                        messages["sms_body"],
                        site.contact_phone
                    )
                    
                    # Update alert status
                    if email_success and sms_success:
                        alert.status = "sent"
                        alert.sent_at = datetime.now(timezone.utc)
                    else:
                        alert.status = "error"
                        alert.error_message = "Failed to send some notifications"
                    
                    db.commit()
                    
                    if alert.status == "sent":
                        logger.info(f"Alert sent successfully for {site.name}")
                    else:
                        logger.warning(f"Partial alert delivery for {site.name}")
                    
                except Exception as e:
                    alert.status = "error"
                    alert.error_message = str(e)
                    db.commit()
                    raise
                
            except Exception as e:
                logger.error("Error processing prediction", extra={
                    "prediction_id": prediction_id,
                    "error": str(e)
                })
                raise
