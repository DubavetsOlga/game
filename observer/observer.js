export class EventEmitter {
    on(eventName, callback) {
        this.subscribe(eventName, callback)
    }
    off(eventName, callback) {
        if (!this.#subscribers[eventName]) return;
        this.#subscribers[eventName] = this.#subscribers[eventName].filter(
            (cb) => cb !== callback
        );
    }
    subscribe(eventName, callback) {
        if (!this.#subscribers[eventName]) {
            this.#subscribers[eventName] = [];
        }
        this.#subscribers[eventName].push(callback);

        // Возвращаем функцию для отписки
        return () => {
            this.#subscribers[eventName] = this.#subscribers[eventName].filter(
                (cb) => cb !== callback
            );
        };
    }

    #subscribers = {
        // eventName: [callback1, callback2, ...]
    };

    emit(eventName, data) {
        if (!this.#subscribers[eventName]) return;
        this.#subscribers[eventName].forEach(callback => callback(data));
    }
}
