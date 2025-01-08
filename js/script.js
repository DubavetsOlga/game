import Game from "../core/game";

let isSoundOn = true;

function toggleSound() {
    isSoundOn = !isSoundOn;
    const soundButton = document.querySelector('.toggle');
    soundButton.textContent = isSoundOn ? 'Sound on' : 'Sound off';
}

function playSound(soundFile) {
    if (!isSoundOn) return;

    const audio = new Audio(soundFile);
    audio.play();
}

// Пример использования
// playSound('sounds/win.mp3'); // Звук победы
// playSound('sounds/lose.mp3'); // Звук поражения



/*
function startGame(gridSize, pointsToWin, pointsToLose) {
    // Логика инициализации игры
    console.log(`Grid size: ${gridSize}, Points to win: ${pointsToWin}, Points to lose: ${pointsToLose}`);
}*/


///---------table


// const tableElement = document.querySelector('.table tbody');
//
// function createGrid(rows, columns) {
//     tableElement.innerHTML = ''; // Очистка таблицы
//
//     for (let y = 0; y < rows; y++) {
//         const trElement = document.createElement('tr');
//
//         for (let x = 0; x < columns; x++) {
//             const tdElement = document.createElement('td');
//             tdElement.className = 'cell';
//             trElement.appendChild(tdElement);
//         }
//
//         tableElement.appendChild(trElement);
//     }
// }

// Пример создания сетки 4x4
//createGrid(4, 4);


////-----------modal



const winModal = document.getElementById('winModal');
const loseModal = document.getElementById('loseModal');

function showWinModal() {
    winModal.style.display = 'block';
}

function showLoseModal() {
    loseModal.style.display = 'block';
}

function hideModals() {
    winModal.style.display = 'none';
    loseModal.style.display = 'none';
}

// Пример вызова при победе
showWinModal();

// Пример вызова при поражении
showLoseModal();

// Скрыть модальные окна при нажатии на кнопку "Play again"
document.querySelectorAll('.modal .button').forEach(button => {
    button.addEventListener('click', () => {
        hideModals();
        // Дополнительные действия, например, перезапуск игры
    });
});