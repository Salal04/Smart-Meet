import os
import pickle
import time
import cv2
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torch.nn.functional as F
from tqdm import tqdm
from pynvml import nvmlInit, nvmlDeviceGetCount, nvmlDeviceGetHandleByIndex, nvmlDeviceGetMemoryInfo, nvmlShutdown
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, classification_report
import matplotlib.pyplot as plt
from marlin_pytorch import Marlin
import numpy as np
from torch.utils.data import Dataset, DataLoader
import pandas as pd;
import torch;
import os;
import cv2;
from pathlib import Path;


# LSTM Classifier
class LSTMClassifier(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, dropout_rate):
        super(LSTMClassifier, self).__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout_rate
        )

    def forward(self, x):
        x = x.float()
        output, (hn, cn) = self.lstm(x)
        return hn[-1]


device = "cuda" if torch.cuda.is_available() else "cpu";
# Set hyperparameters
hidden_size = 512
dropout_rate = 0.5
num_layers = 1
num_classes = 3
# Model for full frame features

model_face = LSTMClassifier(
    input_size=1024,
    hidden_size=hidden_size,
    num_layers=num_layers,
    dropout_rate=dropout_rate
).to(device)

# MLP to combine outputs
combined_feature_size = hidden_size * 1
mlp_classifier = nn.Sequential(
    nn.Linear(combined_feature_size, 512),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(512, num_classes)
).to(device)

Marlin_Model = Marlin.from_file(f"marlin_vit_large_ytf", f"/content/Project/Models/marlin_vit_large_ytf.encoder.pt")
Marlin_Model.to(device)
class CombinedModel(nn.Module):
    def __init__(self, lstm, mlp_classifier):
        super(CombinedModel, self).__init__()
        self.LSTM_Model = lstm
        self.classifier = mlp_classifier

    def forward(self, features):
        x_out = self.LSTM_Model(features);
        logits = self.classifier(x_out);
        return logits;

combined_model = CombinedModel(model_face, mlp_classifier).to(device);
checkpoint = torch.load("/content/Project/Models/best_combined_model_lstm .pt",weights_only=True)
combined_model.LSTM_Model.load_state_dict(checkpoint['model_face_state_dict'])
combined_model.classifier.load_state_dict(checkpoint['mlp_classifier_state_dict'])
combined_model.to(device)
class_names = ["Not Engaged", "Engaged", "Highly- Engaged"]

class EngageNetDataset(Dataset):
  
    def __init__(self, ps):
        self.videos_path = []
        for f in Path(ps).glob("*.mp4"):
            self.videos_path.append(f)   # ✅ keep Path object

    def __len__(self):
        return len(self.videos_path)

    def __getitem__(self, idx):
        user_id = self.videos_path[idx].stem   # ✅ correct way
        return str(self.videos_path[idx]), user_id




def predict(path, batch_size=8, device=None):

    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    dataset = EngageNetDataset(path)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)

    combined_model.eval()
    combined_model.to(device)

    class_names = ["Not-Engaged", "Engaged", "Highly-Engaged"]

    all_pred_names = []
    all_user_ids = []
    all_paths = []

    start_time = time.time()

    with torch.no_grad():
        for batch_data, batch_ids in loader:

            batch_features = []

            # extract Marlin features
            for video_path in batch_data:
                feat = Marlin_Model.extract_video(video_path)
                
                # ensure tensor
                if isinstance(feat, np.ndarray):
                    feat = torch.tensor(feat)

                batch_features.append(feat)

            # stack → (B, T, F)
            batch_features = torch.stack(batch_features).to(device)

            logits = combined_model(batch_features)

            pred_indices = torch.argmax(logits, dim=1)

            batch_class_names = [class_names[i] for i in pred_indices.cpu().numpy()]

            all_pred_names.extend(batch_class_names)
            all_user_ids.extend(batch_ids)
            
            for f in batch_data:
              try:
                  os.remove(f)
              except:
                  pass
                  
    end_time = time.time()   # ⏱️ end

    print(f"⏱️ Predict function time: {end_time - start_time:.4f} seconds")



    return all_pred_names, all_user_ids

        
