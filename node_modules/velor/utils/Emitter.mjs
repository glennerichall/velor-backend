import {MapArray} from "./map.mjs";

export const EmitterMixin = Base => class extends Base {
    #listeners = new MapArray();
    #globals = [];
    #idCount = 1;
    #async;
    #asyncTimeout;

    constructor({async = false, asyncTimeout = 0} = {}, ...args) {
        super(...args);
        this.#async = async;
        this.#asyncTimeout = asyncTimeout;
    }

    #emit(event, ...value) {
        return () => {

            // copy arrays for iteration to avoid missing callbacks if any are removed while emitting
            let listeners = this.#listeners.get(event) ?? [];
            listeners = [...listeners];
            let globals = [...this.#globals];

            for (let listener of listeners) {
                listener.callback(...value)
            }

            for (let listener of globals) {
                listener.callback(event, ...value)
            }
        }
    }

    emitNextTick(event, ...value) {
        let emit = this.#emit(event, ...value);
        setTimeout(emit, 0);
    }

    emit(event, ...value) {
        let emit = this.#emit(event, ...value);

        if (!this.#async) {
            emit();
        } else {
            setTimeout(emit, this.#asyncTimeout);
        }
    }

    onAny(callback) {
        this.#idCount++;
        this.#globals.push({id: this.#idCount, callback});
        const id = this.#idCount;
        return () => {
            for (let i = 0; i < this.#globals.length; i++) {
                if (this.#globals[i].id === id) {
                    this.#globals.splice(i, 1);
                    break;
                }
            }
        };
    }

    once(event, callback, filter) {
        const off = this.on(event, (...args) => {
            if (!filter || filter(event, ...args)) {
                off();
                callback(...args);
            }
        });
    }

    awaitOn(event, filter) {
        return new Promise((resolve, reject) => {
            this.once(event, (...value) => resolve(value), filter);
        });
    }

    on(event, callback) {
        this.#idCount++;
        const id = this.#idCount;
        this.#listeners.push(event, {id, callback});
        return () => {
            this.off(id);
        }
    }

    off(id) {
        for (let event of [...this.#listeners.keys()]) {
            let index = this.#listeners.findIndex(event, listener => listener.id === id);
            if (index >= 0) {
                this.#listeners.pop(event, index);
            }
        }
    }

    hasListener(event) {
        return this.#listeners.has(event);
    }

    clear() {
        this.#listeners = new MapArray();
        this.#globals = [];
        this.#idCount = 0;
    }
}

export const Emitter = EmitterMixin(class {
});

const globalEmitter = new Emitter();

export const on = (event, callback) => globalEmitter.on(event, callback);
export const emit = (event, value) => globalEmitter.emit(event, value);

export const newEmitterFor = event => {
    return {
        on: callback => on(event, callback),
        emit: value => emit(event, value)
    };
}

