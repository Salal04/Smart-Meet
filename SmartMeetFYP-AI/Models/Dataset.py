import numpy as np
from torch.utils.data import Dataset, DataLoader
import pandas as pd;
import torch;
import os;
import cv2;
from pathlib import Path;
class EngageNetDataset(Dataset):
  
    def __init__(self, ps):
        self.videos_path = [];
        for f in Path(ps).glob("*.mp4"):
          self.videos_path.append(f);

    def __len__(self):
        return len(self.videos_path)

    def video_to_tensor(self ,video_path, max_frames=65):
        cap = cv2.VideoCapture(video_path)
        frames = []

        while len(frames) < max_frames:
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.resize(frame, (224, 224))
            frame = frame / 255.0
            frames.append(frame)

        cap.release()

        # Padding
        while len(frames) < max_frames:
            frames.append(np.zeros((224, 224, 3)))

        frames = np.array(frames)

        # (T, H, W, C) → (C, T, H, W)
        frames = np.transpose(frames, (3, 0, 1, 2))

        return torch.tensor(frames, dtype=torch.float32)

    def __getitem__(self, idx):
        user_id =  self.videos_path[idx].rsplit('/' , 1)[-1].split('.')[0];
        return self.video_to_tensor(self.videos_path[idx]) , user_id;


      

