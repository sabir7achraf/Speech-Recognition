from flask import Flask, render_template, request, jsonify, send_from_directory
import whisper
import random
import os
from datetime import datetime

app = Flask(__name__)
model = whisper.load_model("base")

# Phrases arabes simples
TEXTS = [
    "الولدُ يقرأُ كتابًا في المكتبة",
    "ذهبتُ إلى المدرسةِ باكرًا",
    "السماءُ صافيةٌ اليوم",
    "أحبُ أن أتعلمَ أشياءً جديدة",
    "الطفلُ يلعبُ في الحديقة",
    "أنا أقرأُ القرآنَ كلَّ يوم"
]

@app.route("/")
def index():
    text = random.choice(TEXTS)
    return render_template("index.html", random_text=text)

@app.route("/upload", methods=["POST"])
def upload():
    audio = request.files["audio_data"]
    text_expected = request.form["expected_text"]

    filename = datetime.now().strftime("%Y%m%d%H%M%S") + ".webm"
    filepath = os.path.join("recordings", filename)
    audio.save(filepath)

    result = model.transcribe(filepath)
    text_transcribed = result["text"]

    return jsonify({
        "transcribed": text_transcribed.strip(),
        "expected": text_expected.strip(),
        "match": text_expected.strip().lower() == text_transcribed.strip().lower(),
        "audio_path": f"/recordings/{filename}"
    })

@app.route('/recordings/<filename>')
def uploaded_file(filename):
    return send_from_directory("recordings", filename)

if __name__ == "__main__":
    os.makedirs("recordings", exist_ok=True)
    app.run(debug=True)
