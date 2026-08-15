from flask import Flask
from flask_cors import CORS
from routes.video_routes import video_bp

app = Flask(__name__)

CORS(app, origins="*", allow_headers=["Content-Type", "ngrok-skip-browser-warning"])

app.register_blueprint(video_bp)