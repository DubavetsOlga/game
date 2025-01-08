import {Game} from "./game";

describe('game tests', () => {
    let game;
    beforeEach(() => {
        game = new Game(1);
    });
    afterEach(async () => {
        await game.stop();
    });

    it('init test', () => {
        //const game = new Game()

        game.settings = {
            gridSize: {
                x: 4,
                y: 5,
            },
        }

        expect(game.settings.gridSize.x).toBe(4)
        expect(game.settings.gridSize.y).toBe(5)
    })

    it('start game', async () => {
        game.settings = {
            gridSize: {
                x: 4,
                y: 5,
            },
        }

        expect(game.status).toBe('pending')
        await game.start()
        expect(game.status).toBe('in-process')
    })

    it('player1, player2 should have unique coordinates', async () => {
        for (let i = 0; i < 10; i++) {
            const game = new Game()
            game.settings = {
                gridSize: {
                    x: 2,
                    y: 3,
                },
            }

            await game.start()

            expect([1, 2]).toContain(game.player1.position.x)
            expect([1, 2, 3]).toContain(game.player1.position.y)

            expect([1, 2]).toContain(game.player2.position.x)
            expect([1, 2, 3]).toContain(game.player2.position.y)

            expect(
                game.player1.position.x !== game.player2.position.x ||
                game.player1.position.y !== game.player2.position.y
            )

            expect([1]).toContain(game.google.position.x)
            expect([1, 2, 3]).toContain(game.google.position.y)

            expect(
                (game.player1.position.x !== game.player2.position.x ||
                    game.player1.position.y !== game.player2.position.y) &&
                (game.player1.position.x !== game.google.position.x ||
                    game.player1.position.y !== game.google.position.y) &&
                (game.player2.position.x !== game.google.position.x ||
                    game.player2.position.y !== game.google.position.y)
            ).toBe(true)
        }
    })

    it('check google positions after jump', async () => {
        // setter
        game.settings = {
            gridSize: {
                columnsCount: 1,
                rowsCount: 4,
            },
            googleJumpInterval: 100,
        }

        await game.start()

        const prevPositions = game.google.position.clone()

        await sleep(150)

        expect(game.google.position.equal(prevPositions)).toBe(false)
    })

    it('catch google by player1 or player2 for one row', async () => {
        for (let i = 0; i < 10; i++) {
            game = new Game()
            // setter
            game.settings = {
                gridSize: {
                    columns: 3,
                    rows: 1,
                },
            }

            await game.start()
            // p1 p2 g | p1 g p2 | p2 p1 g | p2 g p1 | g p1 p2 | g p2 p1
            const deltaForPlayer1 = game.google.position.x - game.player1.position.x

            const prevGooglePosition = game.google.position.clone()

            if (Math.abs(deltaForPlayer1) === 2) {
                const deltaForPlayer2 = game.google.position.x - game.player2.position.x
                if (deltaForPlayer2 > 0) game.movePlayer2Right()
                else game.movePlayer2Left()

                expect(game.score[1].points).toBe(0)
                expect(game.score[2].points).toBe(1)
            } else {
                if (deltaForPlayer1 > 0) game.movePlayer1Right()
                else game.movePlayer1Left()

                expect(game.score[1].points).toBe(1)
                expect(game.score[2].points).toBe(0)
            }

            expect(game.google.position.equal(prevGooglePosition)).toBe(false)
        }
    })

    it("catch google by player1 or player2 for one column", async () => {
        for (let i = 0; i < 10; i++) {
            game = new Game();
// setter
            game.settings = {
                gridSize: {
                    columns: 1,
                    rows: 3,
                },
            };

            await game.start();
            // p1   p1   p2   p2    g    g
            // p2    g   p1    g   p1   p2
            //  g   p2    g   p1   p2   p1
            const deltaForPlayer1 = game.google.position.y - game.player1.position.y;


            const prevGooglePosition = game.google.position.clone();


            if (Math.abs(deltaForPlayer1) === 2) {
                const deltaForPlayer2 =
                    game.google.position.y - game.player2.position.y;
                if (deltaForPlayer2 > 0) game.movePlayer2Down();
                else game.movePlayer2Up();


                expect(game.score[1].points).toBe(0);
                expect(game.score[2].points).toBe(1);
            } else {
                if (deltaForPlayer1 > 0) game.movePlayer1Down();
                else game.movePlayer1Up();


                expect(game.score[1].points).toBe(1);
                expect(game.score[2].points).toBe(0);
            }


            expect(game.google.position.equal(prevGooglePosition)).toBe(false);

        }
    });

    it('first or second player wins', async () => {
        // game = new Game();
        // setter
        game.settings = {
            gridSize: {
                columns: 3,
                rows: 1,
            },
        }
        // game.score = {
        //     1: { points: 0 },
        //     2: { points: 0 },
        // }

        await game.start()
        // p1 p2 g | p1 g p2 | p2 p1 g | p2 g p1 | g p1 p2 | g p2 p1
        const deltaForPlayer1 = game.google.position.x - game.player1.position.x

        if (Math.abs(deltaForPlayer1) === 2) {
            const deltaForPlayer2 = game.google.position.x - game.player2.position.x
            if (deltaForPlayer2 > 0) {
                game.movePlayer2Right()
                game.movePlayer2Left()
                game.movePlayer2Right()
            } else {
                game.movePlayer2Left()
                game.movePlayer2Right()
                game.movePlayer2Left()
            }

            expect(game.status).toBe('finished')
            expect(game.score[1].points).toBe(0)
            expect(game.score[2].points).toBe(3)
        } else {
            if (deltaForPlayer1 > 0) {
                game.movePlayer1Right()
                game.movePlayer1Left()
                game.movePlayer1Right()
            } else {
                game.movePlayer1Left()
                game.movePlayer1Right()
                game.movePlayer1Left()
            }

            expect(game.status).toBe('finished')
            expect(game.score[1].points).toBe(3)
            expect(game.score[2].points).toBe(0)
        }
    })

    const sleep = ms => new Promise(res => setTimeout(res, ms))
})
