export class GameRemoteProxy {
    ws = null
    api = null

    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter
    }

    async start() {
        try {
            this.ws = new WebSocket('ws://localhost:3001')
            if (!this.ws) {
                throw new Error('Failed to create WebSocket')
            }

            this.api = new Api(this.ws) // Инициализация api

            return new Promise((res, rej) => {
                this.ws.onopen = async () => {
                    console.log('WebSocket connection opened')
                    res()
                }
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error)
                    rej(error)
                }
                this.ws.onclose = () => {
                    console.log('WebSocket connection closed')
                }
            })
        } catch (error) {
            console.error('WebSocket creation error:', error)
            throw error
        }
    }

    async stop() {
        if (this.ws) {
            this.ws.close()
        }
    }

    // async finishGame() {
    //     // Реализация
    // }
    //
    // setSettings(settings) {
    //     // Реализация
    // }

    movePlayer1Right() {
        this.api.send('movePlayer1Right')
    }

    movePlayer1Left() {
        this.api.send('movePlayer1Left')
    }

    movePlayer1Up() {
        this.api.send('movePlayer1Up')
    }

    movePlayer1Down() {
        this.api.send('movePlayer1Down')
    }

    movePlayer2Right() {
        this.api.send('movePlayer2Right')
    }

    movePlayer2Left() {
        this.api.send('movePlayer2Left')
    }

    movePlayer2Up() {
        this.api.send('movePlayer2Up')
    }

    movePlayer2Down() {
        this.api.send('movePlayer2Down')
    }

    // async getSettings() {
    //     return this.api.send('getSettings')
    // }

    async getStatus() {
        return this.api.send('getStatus')
    }

    async getPlayer1() {
        return this.api.send('getPlayer1')
    }

    async getPlayer2() {
        return this.api.send('getPlayer2')
    }

    async getGoogle() {
        return this.api.send('getGoogle')
    }

    async getScore() {
        if (!this.api) {
            throw new Error('API is not initialized')
        }
        return this.api.send('getScore')
    }
}

class Api {
    constructor(ws) {
        this.ws = ws
        this.resolvers = {}

        this.ws.addEventListener('message', event => {
            try {
                const resultAction = JSON.parse(event.data)

                if (resultAction === "change") this.emit("change")
                if (resultAction === "gameFinished") this.emit("gameFinished")

                if (resultAction.error) {
                    const resolver = this.resolvers[resultAction.procedure]?.shift()
                    if (resolver) {
                        resolver(Promise.reject(resultAction.error))
                    }
                } else {
                    const resolver = this.resolvers[resultAction.procedure]?.shift()
                    if (resolver) {
                        resolver(resultAction.result)
                    }
                }
            } catch (error) {
                console.error('Failed to parse message:', error)
            }
        })

        this.ws.addEventListener('close', () => {
            Object.keys(this.resolvers).forEach(procedureName => {
                this.resolvers[procedureName].forEach(resolver => {
                    resolver(Promise.reject(new Error('Connection closed')))
                })
                this.resolvers[procedureName] = []
            })
        })

        this.ws.addEventListener('error', error => {
            console.error('WebSocket error:', error)
            Object.keys(this.resolvers).forEach(procedureName => {
                this.resolvers[procedureName].forEach(resolver => {
                    resolver(Promise.reject(error))
                })
                this.resolvers[procedureName] = []
            })
        })
    }

    send(procedureName, timeout = 5000) {
        return new Promise((res, rej) => {
            const timer = setTimeout(() => {
                console.log(`Request timeout for procedure: ${procedureName}`)
                rej(new Error('Request timeout'))
                this.resolvers[procedureName] = this.resolvers[procedureName].filter(r => r !== res)
            }, timeout)

            this.ws.send(
                JSON.stringify({
                    procedure: procedureName,
                })
            )

            if (!this.resolvers[procedureName]) {
                this.resolvers[procedureName] = []
            }

            this.resolvers[procedureName].push(result => {
                clearTimeout(timer)
                res(result)
            })
        })
    }

    on(eventName, callback) {
        this.subscribe(eventName, callback);
    }

    subscribe(eventName, callback) {
        if (!this.#subscribers[eventName]) {
            this.#subscribers[eventName] = [];
        }
        this.#subscribers[eventName].push(callback);

        // Возвращаем функцию для отписки
        return () => {
            this.#subscribers[eventName] = this.#subscribers[eventName].filter(
                (cb) => cb !== callback,
            );
        };
    }

    #subscribers = {
        // eventName: [callback1, callback2, ...]
    };

    emit(eventName, data) {
        if (!this.#subscribers[eventName]) return;
        this.#subscribers[eventName].forEach((callback) => callback(data));
    }
}