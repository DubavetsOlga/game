import Game from "./core/game.js";

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
    game = new Game();
    game.settings = {
        pointsToWin: pointsToWin,
        gridSize: {
            columns: gridSize,
            rows: gridSize,
        },
        googleJumpInterval: googleJumpInterval,
    };

    await game.start();
    render();

    game.eventEmitter.on("change", () => {
        if (game.status === "in-process") render();
    });
    game.eventEmitter.on("gameFinished", () => {
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


const render = () => {
    tableElement.innerHTML = "";
    scoreElement.innerHTML = "";

    for (let y = 1; y <= game.settings.gridSize.rows; y++) {
        const trElement = document.createElement("tr");

        for (let x = 1; x <= game.settings.gridSize.columns; x++) {
            const tdElement = document.createElement("td");

            // Рендеринг google
            if (game.google.position.x === x && game.google.position.y === y) {
                const googleElement = document.createElement("img");
                googleElement.src = "./img/icons/googleIcon.svg";
                tdElement.appendChild(googleElement);
            }

            // Рендеринг игроков
            if (game.player1.position.x === x && game.player1.position.y === y) {
                const player1Element = document.createElement("div");
                player1Element.className = "player1";
                tdElement.appendChild(player1Element);
            }
            if (game.player2.position.x === x && game.player2.position.y === y) {
                const player2Element = document.createElement("div");
                player2Element.className = "player2";
                tdElement.appendChild(player2Element);
            }

            trElement.appendChild(tdElement);
        }

        tableElement.appendChild(trElement);
    }

    // Рендеринг счета
    scoreElement.append(
        `player1: ${game.score[1].points} - player2: ${game.score[2].points}`,
    );
};


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
