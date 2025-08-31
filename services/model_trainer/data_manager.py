from typing import Dict, Any, Tuple, List
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import torch
from torch.utils.data import Dataset, DataLoader
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class RockfallDataset(Dataset):
    """Dataset class for Hugging Face models"""
    def __init__(self, texts: List[str], labels: List[int]):
        self.texts = texts
        self.labels = torch.tensor(labels, dtype=torch.long)

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        return {
            'text': self.texts[idx],
            'label': self.labels[idx]
        }

class DataManager:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.data_dir = Path(config.get('data_dir', 'data'))
        self.feature_columns = config.get('feature_columns', [])
        self.target_column = config.get('target_column', 'incident_48h')
        self.text_column = config.get('text_column', None)
        self.scaler = StandardScaler()

    def load_data(self) -> Tuple[pd.DataFrame, pd.Series]:
        """Load and preprocess the dataset"""
        # Load data from CSV or other sources
        data_path = self.data_dir / self.config['data_file']
        df = pd.read_csv(data_path)
        
        # Handle missing values
        df = self._handle_missing_values(df)
        
        # Extract features and target
        X = df[self.feature_columns]
        y = df[self.target_column]
        
        return X, y

    def prepare_data(self, model_type: str = 'custom') -> Dict[str, Any]:
        """Prepare data for training"""
        X, y = self.load_data()
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, 
            test_size=self.config.get('test_size', 0.2),
            random_state=42
        )
        
        if model_type == 'custom':
            # Scale numerical features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            return {
                'train_data': (X_train_scaled, y_train),
                'test_data': (X_test_scaled, y_test),
                'feature_names': self.feature_columns
            }
        
        elif model_type == 'huggingface':
            # Prepare text data for transformer models
            if not self.text_column:
                raise ValueError("text_column must be specified for Hugging Face models")
            
            # Create text representations
            train_texts = self._create_text_features(X_train)
            test_texts = self._create_text_features(X_test)
            
            # Create dataloaders
            train_dataset = RockfallDataset(train_texts, y_train.tolist())
            test_dataset = RockfallDataset(test_texts, y_test.tolist())
            
            train_loader = DataLoader(
                train_dataset,
                batch_size=self.config.get('batch_size', 32),
                shuffle=True
            )
            test_loader = DataLoader(
                test_dataset,
                batch_size=self.config.get('batch_size', 32)
            )
            
            return {
                'train_data': train_loader,
                'test_data': test_loader,
                'feature_names': self.feature_columns
            }
        
        else:
            raise ValueError(f"Unknown model type: {model_type}")

    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values in the dataset"""
        # Fill numerical missing values with median
        numerical_columns = df.select_dtypes(include=[np.number]).columns
        df[numerical_columns] = df[numerical_columns].fillna(df[numerical_columns].median())
        
        # Fill categorical missing values with mode
        categorical_columns = df.select_dtypes(include=['object']).columns
        df[categorical_columns] = df[categorical_columns].fillna(df[categorical_columns].mode().iloc[0])
        
        return df

    def _create_text_features(self, X: pd.DataFrame) -> List[str]:
        """Create text representations of features for transformer models"""
        texts = []
        for _, row in X.iterrows():
            text = ""
            for col in self.feature_columns:
                text += f"{col}: {row[col]}. "
            texts.append(text.strip())
        return texts
