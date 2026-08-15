from flask import Blueprint, request, jsonify
from flask import make_response
from services.video_service import save_video, process_videos, worker
import os
from fastapi.responses import FileResponse
import uuid
import time
from services.transcript import GenerationType, transcribe_audio, structure_transcript, build_pdf
video_bp = Blueprint('video_bp', __name__)
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import threading
wait_time = 2
import tempfile
def start_worker():
    print("Worker Called! ----------")
    buffer_path = os.path.join(os.getcwd(), "buffer_videos")
    os.makedirs(buffer_path, exist_ok=True)

    while True:
        try:
            files = os.listdir(buffer_path)
        except Exception as e:
            print("Worker error:", e)
            time.sleep(wait_time)


@video_bp.route('/upload', methods=['POST'])
def upload_video():
    if request.method == 'OPTIONS':
        response = make_response('', 204)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    user_id = request.form.get('user_id')
    meeting_id = request.form.get('meeting_id')
    frames = request.files.getlist('frames')          # ← CHANGED

    print("user_id:", user_id)
    print("meeting_id:", meeting_id)
    print("frames received:", len(frames))

    if not user_id or not meeting_id or not frames:   # ← CHANGED
        return jsonify({"error": "Missing user_id or frames or meeting_id"}), 400

    count = save_video(user_id, meeting_id, frames)   # ← CHANGED

    return jsonify({
        "message": "Frames received and video assembled",
        "total_videos_buffered": count
    })

OUTPUT_DIR = tempfile.gettempdir()
MAX_AUDIO_BYTES = 25 * 1024 * 1024  # 25MB, Whisper API limit
ALLOWED_AUDIO_EXT = {".mp3", ".mp4", ".mpeg", ".mpga", ".m4a", ".wav", ".webm"}


@video_bp.route("/get-notes-or-minutes",  methods=['POST'])
async def get_notes_or_minutes(
    text_transcript,
    is_audio = False,
    audio: UploadFile = File(..., description="Classroom or meeting audio file"),
    generation_type: GenerationType = Form(..., description="'notes' or 'minutes'"),
):
    if is_audio: 
        ext = os.path.splitext(audio.filename or "")[1].lower()
        if ext not in ALLOWED_AUDIO_EXT:
            raise HTTPException(status_code=400, detail=f"Unsupported audio format: {ext}")

        audio_bytes = await audio.read()
        if len(audio_bytes) > MAX_AUDIO_BYTES:
            raise HTTPException(status_code=400, detail="Audio file exceeds 25MB limit")

        job_id = uuid.uuid4().hex
        audio_path = os.path.join(OUTPUT_DIR, f"{job_id}{ext}")
        pdf_path = os.path.join(OUTPUT_DIR, f"{job_id}_{generation_type.value}.pdf")

        with open(audio_path, "wb") as f:
            f.write(audio_bytes)

    try:
        if is_audio:
            transcript = transcribe_audio(audio_path)
        else:
            transcript = text_transcript;
        if not transcript.strip():
            raise HTTPException(status_code=422, detail="Transcription returned empty text")

        structured = structure_transcript(transcript, generation_type)
        build_pdf(structured, generation_type, pdf_path)
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

    filename = f"{structured.get('title', generation_type.value).replace(' ', '_')}.pdf"
    return FileResponse(pdf_path, media_type="application/pdf", filename=filename)

@video_bp.route('/process/<user_id>', methods=['GET'])
def process_user_videos(user_id):
    result = process_videos(user_id)

    if "error" in result:
        return jsonify(result), 404

    return jsonify(result)