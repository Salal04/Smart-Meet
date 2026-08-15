import os
import torch
import cv2
import numpy as np
import time
from Models.Model import predict
import requests
from collections import defaultdict

UPLOAD_FOLDER = "/content/Project/buffer_videos"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

video_buffer = defaultdict(list)


# 🔸 Save video — assembles JPEG frames into mp4
def save_video(user_id, meeting_id, frames):          # ← CHANGED: frames list instead of single file
    file_path = os.path.join(UPLOAD_FOLDER, f"{user_id}_{meeting_id}.mp4")

    first_bytes = np.frombuffer(frames[0].read(), np.uint8)
    first_frame = cv2.imdecode(first_bytes, cv2.IMREAD_COLOR)

    if first_frame is None:
        print("❌ Failed to decode first frame")
        return 0

    h, w = first_frame.shape[:2]
    print(f"✅ First frame decoded: {w}x{h}, total frames: {len(frames)}")

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(file_path, fourcc, 6.0, (w, h))  # 6fps matches DeepProcess
    writer.write(first_frame)

    for frame_file in frames[1:]:
        file_bytes = np.frombuffer(frame_file.read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        if img is not None:
            writer.write(img)

    writer.release()
    print(f"✅ Video saved: {file_path}")

    video_buffer[user_id].append(file_path)
    return len(video_buffer[user_id])


# 🔸 Convert video → tensor (unchanged)
def video_to_tensor(video_path, max_frames=65):
    cap = cv2.VideoCapture(video_path)
    frames = []

    while len(frames) < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.resize(frame, (112, 112))
        frame = frame / 255.0
        frames.append(frame)

    cap.release()

    while len(frames) < max_frames:
        frames.append(np.zeros((112, 112, 3)))

    frames = np.array(frames)
    frames = np.transpose(frames, (3, 0, 1, 2))
    return torch.tensor(frames, dtype=torch.float32)


# 🔸 Process videos (unchanged)
def process_videos(user_id):
    if user_id not in video_buffer or len(video_buffer[user_id]) == 0:
        return {"error": "No videos found for user"}

    tensors = []
    for path in video_buffer[user_id]:
        tensor = video_to_tensor(path)
        tensors.append(tensor)

    batch_tensor = torch.stack(tensors)
    video_buffer[user_id].clear()

    return {
        "message": "Processed successfully",
        "batch_shape": list(batch_tensor.shape)
    }


BATCH_SIZE = 5
TIMEOUT = 2
wait_time = 2
last_run = time.time()

url = "https://your-vercel-backend.vercel.app/api/meetings/ProcessResults"  # ← UPDATE THIS


def send_to_backend(result, user_ids, url):
    try:
        print("Sending Result to ---->")
        payload_list = []

        for i in range(len(result)):
            payload_list.append({
                "user_id": user_ids[i].split('_')[0],
                "meeting_id": user_ids[i].split('_')[1],
                "result": result[i]
            })

        payload = {"All_result": payload_list}
        print("Payload:", payload)

        response = requests.post(url, json=payload, timeout=10)
        print("Status:", response.status_code)

    except Exception as e:
        print("Backend send failed:", e)


def worker():
    global last_run
    print("Worker Called!")

    buffer_path = "/content/Project/buffer_videos"

    while True:
        try:                                                          # ← ADDED try/catch
            files = [f for f in os.listdir(buffer_path) if f.endswith(".mp4")]  # ← only .mp4
            now = time.time()
            queue_size = len(files)

            if queue_size == 0:
                time.sleep(wait_time)
                continue

            if queue_size >= BATCH_SIZE or (now - last_run) >= TIMEOUT:
                print(f"Processing {queue_size} videos...")
                all_predictions, user_ids = predict(buffer_path, BATCH_SIZE)
                send_to_backend(all_predictions, user_ids, url)
                time.sleep(wait_time)
            else:
                time.sleep(wait_time)
                continue

            last_run = now

        except Exception as e:                                        # ← ADDED
            print("Worker error:", e)
            time.sleep(wait_time)