# Rockfall Prediction System 🪨

> **🚧 PROJECT STATUS: UNDER DEVELOPMENT 🚧**
> 
> This project is currently in active development. Features are being added and tested, and the system architecture is being refined. Use with caution in production environments.

## Overview

An AI-powered system for predicting rockfall events using machine learning and real-time environmental data. The system combines weather data, seismic measurements, and geological information to provide early warnings for potential rockfall incidents.

## Features

- **🤖 Dual Model Support**
  - Custom ML models (Random Forest)
  - Hugging Face Transformer models
  - Automated hyperparameter optimization

- **📊 Data Processing**
  - Real-time weather data collection
  - Seismic activity monitoring
  - Feature engineering pipeline
  - Time series analysis

- **🔄 MLOps**
  - Automated model training
  - Model versioning and tracking
  - Performance monitoring
  - A/B testing support

- **🚨 Alert System**
  - Risk level classification
  - Email notifications
  - SMS alerts
  - Alert throttling

- **📈 Monitoring**
  - Prometheus metrics
  - Grafana dashboards
  - Model performance tracking
  - System health monitoring

## System Architecture

```
├── api_gateway      # FastAPI-based API endpoints
├── data_collector   # Environmental data collection
├── model_trainer    # ML model training pipeline
├── prediction_service # Real-time predictions
├── alert_manager    # Alert generation and delivery
└── monitoring       # System and model monitoring
```

## Technology Stack

- **Backend**: FastAPI, Celery
- **Databases**: 
  - PostgreSQL (structured data)
  - InfluxDB (time series data)
- **ML/AI**: 
  - scikit-learn
  - PyTorch
  - Hugging Face Transformers
- **Monitoring**: 
  - Prometheus
  - Grafana
- **Infrastructure**: 
  - Docker
  - Kubernetes (deployment)

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL 16
- Docker & Docker Compose
- Redis

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/pushkargupta75/Rockfall-Prediction-System.git
cd Rockfall-Prediction-System
\`\`\`

2. Set up environment:
\`\`\`bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt
\`\`\`

3. Configure environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your credentials
\`\`\`

4. Initialize database:
\`\`\`bash
alembic upgrade head
\`\`\`

5. Start services:
\`\`\`bash
docker-compose up -d
\`\`\`

### Training Models

1. Prepare your dataset in the \`data\` directory
2. Configure model settings in \`config/model_config.yaml\`
3. Run training:
\`\`\`bash
python train_model.py
\`\`\`

## Development Status

### Completed Features
- ✅ Basic system architecture
- ✅ ML pipeline setup
- ✅ Database models
- ✅ API endpoints
- ✅ Docker configuration

### In Progress
- 🔄 Model optimization
- 🔄 Alert system refinement
- 🔄 Frontend dashboard
- 🔄 Testing coverage

### Planned Features
- 📋 Advanced model architectures
- 📋 Real-time visualization
- 📋 Mobile app integration
- 📋 Advanced anomaly detection

## Contributing

This project is under active development. Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Weather data providers
- Geological survey departments
- Open source ML community

## Contact

- **Developer**: Pushkar Gupta
- **GitHub**: [@pushkargupta75](https://github.com/pushkargupta75)

---

> 🚧 **Development Notice**: This system is actively being developed and tested. Some features may be incomplete or subject to change. Please report any issues or suggestions through GitHub issues.

# Rockfall Predictor

Project for rockfall prediction using DEM, drone imagery, and weather data.

## Project Structure

```
data/
  raw/                 # Raw DEM, drone images, weather logs
  processed/           # Preprocessed, ML-ready data
  external/            # API data (weather, blasting logs)
  datasets/            # Historical datasets (train/test splits)

src/
  data_collection/     # Scripts to fetch & store DEM, images, APIs
    fetch_dem.py
    fetch_drone.py
    fetch_weather.py
  preprocessing/       # Data cleaning & feature extraction
    preprocess_dem.py
    preprocess_images.py
    preprocess_weather.py
  models/              # ML/DL models
    dem_model.py
    drone_cnn.py
    weather_model.py
    fusion_model.py
  prediction/          # Prediction & risk scoring
    risk_scorer.py
    run_prediction.py
  api/                 # REST API (FastAPI/Flask)
    main.py
    routes/
      predict.py
      upload.py
      health.py
  alerts/              # Alert & reporting system
    sms_alerts.py
    email_alerts.py
    report_generator.py
  utils/               # Helper functions
    logger.py
    config_loader.py
    visualization.py

frontend/                # React dashboard
  public/
  src/
    components/
      RiskMap.js
      CrackTimeline.js
      WeatherChart.js
    pages/
    services/        # API integration
  package.json

config/                  # Config files
  settings.yaml
  logging.conf

tests/                   # Unit + integration tests
  test_models.py
  test_preprocessing.py
  test_api.py

deployment/              # Deployment scripts
  Dockerfile
  docker-compose.yml
  ci-cd.yaml           # GitHub Actions/GitLab CI
  k8s/                 # Kubernetes manifests (if needed)

notebooks/               # Jupyter experiments
  eda_dem.ipynb
  eda_drone.ipynb
  model_prototyping.ipynb

requirements.txt         # Python dependencies
README.md                # Project documentation
LICENSE
```

## GitHub Integration
- CI/CD pipeline is defined in `deployment/ci-cd.yaml` for GitHub Actions.
- Please connect your repository to GitHub and enable Actions for automated testing and deployment.
