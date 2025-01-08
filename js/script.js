import Game from "../core/game";

let isSoundOn = true;

function toggleSound() {
    isSoundOn = !isSoundOn;
    const soundButton = document.querySelector(".toggle");
    soundButton.textContent = isSoundOn ? "Sound on" : "Sound off";
}

function playSound(soundFile) {
    if (!isSoundOn) return;

    const audio = new Audio(soundFile);
    audio.play();
}

// Пример использования
// playSound('sounds/win.mp3'); // Звук победы
// playSound('sounds/lose.mp3'); // Звук поражения
