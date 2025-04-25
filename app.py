from flask import Flask, render_template, request, jsonify
import whisper
import random
import os
from datetime import datetime

app = Flask(__name__)
model = whisper.load_model("base")

# Liste de phrases simples
TEXTS = [
    "Bonjour, je m'appelle Léa et j'aime lire.",
    "Le chat dort sur le canapé.",
    "Aujourd'hui, il fait très beau.",
    "Le livre est sur la table.",
    "Je vais à l'école à pied."
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
        "match": text_expected.strip().lower() == text_transcribed.strip().lower()
    })

if __name__ == "__main__":
    os.makedirs("recordings", exist_ok=True)
    app.run(debug=True)
