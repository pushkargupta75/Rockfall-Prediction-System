from typing import Dict, Any, Optional, Union
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from sklearn.ensemble import RandomForestClassifier
import pytorch_lightning as pl
import wandb
from pathlib import Path
import joblib
import uuid
from datetime import datetime, timezone
import logging
from services.common.models import Model
from services.common.database import get_db

logger = logging.getLogger(__name__)

class BaseModel:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.model = None
        self.model_path = None

    def save(self, path: str):
        raise NotImplementedError

    def load(self, path: str):
        raise NotImplementedError

    def train(self, train_data: Any, valid_data: Any):
        raise NotImplementedError

    def predict(self, features: Any) -> Dict[str, float]:
        raise NotImplementedError

class CustomRockfallModel(BaseModel):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.feature_columns = config.get('feature_columns', [])
        
    def save(self, path: str):
        model_artifacts = {
            'pipeline': self.model,
            'feature_columns': self.feature_columns,
            'config': self.config
        }
        joblib.dump(model_artifacts, path)
        self.model_path = path

    def load(self, path: str):
        artifacts = joblib.load(path)
        self.model = artifacts['pipeline']
        self.feature_columns = artifacts['feature_columns']
        self.config.update(artifacts['config'])
        self.model_path = path

    def train(self, train_data: Any, valid_data: Any):
        self.model = RandomForestClassifier(**self.config.get('model_params', {}))
        self.model.fit(train_data[0], train_data[1])

    def predict(self, features: Any) -> Dict[str, float]:
        proba = self.model.predict_proba([features])[0]
        return {'probability': float(proba[1])}

class HuggingFaceModel(BaseModel):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.model_name = config['model_name']
        self.tokenizer = None

    def save(self, path: str):
        Path(path).mkdir(parents=True, exist_ok=True)
        self.model.save_pretrained(path)
        self.tokenizer.save_pretrained(path)
        self.model_path = path

    def load(self, path: str):
        self.model = AutoModelForSequenceClassification.from_pretrained(path)
        self.tokenizer = AutoTokenizer.from_pretrained(path)
        self.model_path = path

    def train(self, train_data: Any, valid_data: Any):
        # Initialize wandb for experiment tracking
        wandb.init(project="rockfall-prediction", config=self.config)
        
        # Training logic using PyTorch Lightning
        trainer = pl.Trainer(
            max_epochs=self.config.get('epochs', 10),
            accelerator='gpu' if torch.cuda.is_available() else 'cpu',
            logger=pl.loggers.WandbLogger(project="rockfall-prediction")
        )
        trainer.fit(self.model, train_data, valid_data)
        wandb.finish()

    def predict(self, features: Any) -> Dict[str, float]:
        inputs = self.tokenizer(features, return_tensors="pt", padding=True, truncation=True)
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)
        return {'probability': float(probs[0][1])}

class ModelFactory:
    @staticmethod
    def create_model(model_type: str, config: Dict[str, Any]) -> Union[CustomRockfallModel, HuggingFaceModel]:
        if model_type == 'custom':
            return CustomRockfallModel(config)
        elif model_type == 'huggingface':
            return HuggingFaceModel(config)
        else:
            raise ValueError(f"Unknown model type: {model_type}")

    @staticmethod
    def register_model(
        model: Union[CustomRockfallModel, HuggingFaceModel],
        name: str,
        metrics: Dict[str, float],
        parameters: Dict[str, Any]
    ) -> str:
        """Register a trained model in the database"""
        model_id = str(uuid.uuid4())
        model_path = f"models/{model_id}.joblib"
        
        # Save the model
        model.save(model_path)
        
        # Register in database
        with get_db() as db:
            model_record = Model(
                id=model_id,
                name=name,
                version=datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S"),
                type=model.__class__.__name__,
                trained_at=datetime.now(timezone.utc),
                metrics=metrics,
                parameters=parameters,
                feature_columns=model.feature_columns if hasattr(model, 'feature_columns') else [],
                file_path=model_path,
                status='active'
            )
            db.add(model_record)
            db.commit()
        
        return model_id
