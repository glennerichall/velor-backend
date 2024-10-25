export function timeoutAsync(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, ms);
    });
}

export async function waitUntilAsync(pred, timeout = 500) {
    while (!pred()) {
        await timeoutAsync(timeout);
    }
}

export async function waitEvent(target, event) {
    return new Promise(resolve => {
        const onEvent = (data) => {
            target.off(event, onEvent);
            resolve(data);
        };
        target.on(event, onEvent);
    });
}

export class TimeoutError extends Error {
    constructor(...args) {
        super(...args);
        this.name = 'TimeoutError';
    }
}

export class RevokedError extends Error {
    constructor(...args) {
        super(...args);
        this.name = 'RevokedError';
    }
}

export class Synchronizer {
    constructor(timeout = 10000) {
        // FIXME should be a Map
        this._requests = {};
        this._timeout = timeout;
    }

    revoke(id) {
        let request = this._requests[id];
        if (request) {
            this.reject(id, new RevokedError(`Sync ${id} was revoked`));
        }
    }

    hasSync(id) {
        return !!this._requests[id];
    }

    getSync(id) {
        if (this._requests[id]) {
            return Promise.reject(new Error(`Lock ${id} was already declared`));
        }
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                delete this._requests[id];
                reject(new TimeoutError(`Timeout before response from ${id}`));
            }, this._timeout);
            const onResolve = (...args) => {
                clearTimeout(timeoutId);
                resolve(...args);
            }
            this._requests[id] = {resolve: onResolve, reject, timeoutId};
        });
    }

    reject(id, content) {
        const resolver = this._requests[id];
        delete this._requests[id];
        if (resolver) {
            const {reject, timeoutId} = resolver;
            clearTimeout(timeoutId);
            reject(content);
        } else {
            throw new Error(`No waiting lock for ${id}`);
        }
    }

    notify(id, content) {
        const resolver = this._requests[id];
        delete this._requests[id];
        if (resolver) {
            const {resolve, reject} = resolver;
            if (content instanceof Error) {
                reject(content);
            } else {
                resolve(content);
            }
        } else {
            throw new Error(`No waiting lock for ${id}`);
        }
    }
}

