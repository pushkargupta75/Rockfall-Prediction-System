import os
from pathlib import Path
from services.model_trainer.trainer import ModelTrainer
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    # Ensure config directory exists
    config_path = Path('config/model_config.yaml')
    if not config_path.exists():
        raise FileNotFoundError(
            f"Config file not found at {config_path}. Please ensure config/model_config.yaml exists."
        )

    # Ensure data directory exists
    data_dir = Path('data')
    if not data_dir.exists():
        data_dir.mkdir(parents=True)
        logger.info(f"Created data directory at {data_dir}")

    # Initialize trainer
    trainer = ModelTrainer(str(config_path))
    
    try:
        # Train model
        logger.info("Starting model training...")
        model_id = trainer.train()
        logger.info(f"Training completed successfully! Model ID: {model_id}")
        
        return model_id
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()
