let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resultText = document.getElementById("resultText");
const randomText = document.getElementById("randomText").textContent;

startBtn.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("audio_data", audioBlob);
        formData.append("expected_text", randomText);

        const response = await fetch("/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        resultText.innerHTML = `
            <p><strong>النص المتوقع:</strong> ${data.expected}</p>
            <p><strong>النص المستمع:</strong> ${data.transcribed}</p>
            <p><strong>مطابقة:</strong> ${data.match ? "✅ نعم" : "❌ لا"}</p>
            <p><strong>الاستماع إلى التسجيل:</strong></p>
            <audio controls src="${data.audio_path}"></audio>
        `;
    };

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
};

stopBtn.onclick = () => {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
};
