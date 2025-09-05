import uvicorn
import subprocess
import sys
import time
from pathlib import Path

def start_services():
    print("Initializing database...")
    
    # Create SQLite database if it doesn't exist
    from services.common.database import engine
    from services.common.models import Base
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database initialized successfully!")
    Base.metadata.create_all(bind=engine)
    
    print("Starting services...")
    
    # Start API Gateway
    api_process = subprocess.Popen([
        sys.executable, "-m", "uvicorn",
        "services.api_gateway.main:app",
        "--host", "0.0.0.0",
        "--port", "8000"
    ])
    
    # Start Prediction Service
    prediction_process = subprocess.Popen([
        sys.executable, "-m", "uvicorn",
        "services.prediction_service.main:app",
        "--host", "0.0.0.0",
        "--port", "8001"
    ])
    
    # Start Alert Manager
    alert_process = subprocess.Popen([
        sys.executable, "-m", "uvicorn",
        "services.alert_manager.main:app",
        "--host", "0.0.0.0",
        "--port", "8002"
    ])
    
    # Start Data Collector (runs in background)
    collector_process = subprocess.Popen([
        sys.executable,
        str(Path(__file__).parent / "services" / "data_collector" / "main.py")
    ])
    
    try:
        print("\nServices are running!")
        print("API Gateway: http://localhost:8000")
        print("Prediction Service: http://localhost:8001")
        print("Alert Manager: http://localhost:8002")
        print("\nPress Ctrl+C to stop all services...")
        
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping services...")
        api_process.terminate()
        prediction_process.terminate()
        alert_process.terminate()
        collector_process.terminate()
        
        api_process.wait()
        prediction_process.wait()
        alert_process.wait()
        collector_process.wait()
        print("All services stopped.")

if __name__ == "__main__":
    start_services()
