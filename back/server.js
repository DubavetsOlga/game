import {WebSocketServer} from 'ws'
import Game from "../core/game.js";
import {EventEmitter} from "../observer/observer.js";

const eventEmitter = new EventEmitter()
const game = new Game(eventEmitter)

await game.start()

const wss = new WebSocketServer({port: 3001})
wss.on('connection', (ws) => {
    console.log('New WebSocket connection')

    ws.on('message', async (data) => {
        let action = "";
        try {
            action = JSON.parse(data)

            if (!action.procedure || typeof action.procedure !== 'string') {
                throw new Error('Invalid action format')
            }

            if (typeof game[action.procedure] === 'function') {
                console.log(`Executing procedure: ${action.procedure}`) // Логирование для отладки
                const result = await game[action.procedure]()
                console.log(`Result of ${action.procedure}:`, result) // Логирование для отладки
                const response = {
                    procedure: action.procedure,
                    result: result,
                    type: 'response',
                }
                ws.send(JSON.stringify(response)) // Отправляем результат клиенту
            } else {
                console.error(`Procedure "${action.procedure}" not found`)
                ws.send(JSON.stringify({error: `Procedure "${action.procedure}" not found`}))
            }
        } catch (error) {
            console.error(`Error executing procedure "${action.procedure}":`, error)
            ws.send(JSON.stringify({error: `Failed to execute procedure "${action.procedure}"`}))
        }
    })

    ws.on('close', () => {
        console.log('Client disconnected')
    })

    ws.on('error', (error) => {
        console.error('WebSocket error:', error)
    })

    game.eventEmitter.subscribe('change', () => {
        if (game.status === "in-process") {
            ws.send(JSON.stringify('change'))
        }
    })
    game.eventEmitter.subscribe('gameFinished', () => {
        ws.send(JSON.stringify('gameFinished'))
    })
})
