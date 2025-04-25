let mediaRecorder;
let audioChunks = [];

document.getElementById("start-btn").onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    audioChunks = [];

    mediaRecorder.ondataavailable = e => {
        audioChunks.push(e.data);
    };

    document.getElementById("start-btn").disabled = true;
    document.getElementById("stop-btn").disabled = false;
};

document.getElementById("stop-btn").onclick = () => {
    mediaRecorder.stop();

    mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioURL = URL.createObjectURL(blob);

        // Crée et joue l'enregistrement
        const player = document.createElement("audio");
        player.controls = true;
        player.src = audioURL;
        document.getElementById("audio-preview").innerHTML = "";
        document.getElementById("audio-preview").appendChild(player);
        player.play();

        // Envoi au backend
        const formData = new FormData();
        formData.append("audio_data", blob);
        formData.append("expected_text", document.getElementById("target-text").innerText);

        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        document.getElementById("result").innerText = `
Texte attendu: ${data.expected}
Texte lu: ${data.transcribed}
Correspondance: ${data.match ? "✅ Correct" : "❌ Incorrect"}
        `;

        document.getElementById("start-btn").disabled = false;
        document.getElementById("stop-btn").disabled = true;
    };
};
