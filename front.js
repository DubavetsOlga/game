import {GameRemoteProxy as Game} from './core/gameRemoteProxy.js'
import {EventEmitter} from "./observer/observer.js";

const scoreElement = document.querySelector("#score");
const tableElement = document.querySelector(".table tbody");
const winModal = document.getElementById("winModal");
const loseModal = document.getElementById("loseModal");
let game;

const start = async () => {
    startButton.style.display = "none";
    winModal.style.display = "none";
    loseModal.style.display = "none";

    const gridSize = document.getElementById("01").value; // Получаем выбранный размер сетки
    const pointsToWin = parseInt(document.getElementById("02").value); // Получаем выбранные очки для победы
    //const pointsToLose = document.getElementById("03").value; // Получаем выбранные очки для поражения
    const googleJumpInterval = parseInt(document.getElementById("04").value) * 1000;

    // Инициализация игры с выбранными параметрами
    const eventEmitter = new EventEmitter()
    game = new Game(eventEmitter)
    await game.start()

    game.setSettings({
        pointsToWin: pointsToWin,
        gridSize: {
            columns: gridSize,
            rows: gridSize,
        },
        googleJumpInterval: googleJumpInterval,
    });

    await render();

    game.eventEmitter.subscribe('change', () => {
        console.log('changed')
        render()
    })

    game.eventEmitter.subscribe("gameFinished", () => {
        tableElement.replaceChildren();
        winModal.style.display = "block";
        //loseModal.style.display = "block";
    });
};

const startButton = document.querySelector(".main-button");

startButton.addEventListener("click", () => {
    start();
});

document.querySelectorAll(".modal .button").forEach((button) => {
    button.addEventListener("click", () => {
        start();
    });
});

const render = async () => {
    if (!game) {
        console.error('Game is not initialized')
        return
    }

    try {
        const score = await game.getScore()
        const settings = await game.getSettings()
        const google = await game.getGoogle()
        const player1 = await game.getPlayer1()
        const player2 = await game.getPlayer2()

        tableElement.innerHTML = "";
        scoreElement.innerHTML = "";

        scoreElement.append(`player1 Score: ${score[1].points} - player2 Score: ${score[2].points}`)

        for (let y = 1; y <= settings.gridSize.rows; y++) {
            const trElement = document.createElement('tr')
            for (let x = 1; x <= settings.gridSize.columns; x++) {
                const tdElement = document.createElement('td')

                if (player1.position.x === x && player1.position.y === y) {
                    const imgElement = document.createElement('img')
                    imgElement.src = "./img/icons/man01.svg";
                    tdElement.append(imgElement)
                }

                if (player2.position.x === x && player2.position.y === y) {
                    const imgElement = document.createElement('img')
                    imgElement.src = "./img/icons/man02.svg";
                    tdElement.append(imgElement)
                }

                if (google.position.x === x && google.position.y === y) {
                    const imgElement = document.createElement('img')
                    imgElement.src = "./img/icons/googleIcon.svg";
                    tdElement.append(imgElement)
                }

                trElement.append(tdElement)
            }
            tableElement.append(trElement)
        }
    } catch (error) {
        console.error('Error rendering game:', error)
    }
}

window.addEventListener("keydown", (e) => {
    if (!game) return; // Проверка, что game инициализирован

    switch (e.code) {
        case "ArrowUp":
            game.movePlayer1Up();
            break;
        case "ArrowDown":
            game.movePlayer1Down();
            break;
        case "ArrowLeft":
            game.movePlayer1Left();
            break;
        case "ArrowRight":
            game.movePlayer1Right();
            break;
        case "KeyW":
            game.movePlayer2Up();
            break;
        case "KeyS":
            game.movePlayer2Down();
            break;
        case "KeyA":
            game.movePlayer2Left();
            break;
        case "KeyD":
            game.movePlayer2Right();
            break;
    }
});
