import {timeoutAsync as asyncTimeout} from "./sync.mjs";

export function broadcast(...functions) {
    return (...args) => {
        return functions.map(f => f(...args));
    };
}

let callbackIndex = {};

export function deferBroadcast(id, ...callbacks) {
    // get previously registered callbacks
    let callback = callbackIndex[id];

    // run the deferred callbacks if present
    if (callback) {
        callback();
    }

    // save the new callbacks
    callbackIndex[id] = broadcast(...callbacks);
}

export function exponentialBackoffWithJitter(retries) {
    const base = 100; // Base delay in milliseconds, adjust as needed
    const cap = 2000; // Cap for the delay in milliseconds, adjust as needed
    const randomFactor = 0.5; // Factor for randomness, adjust as needed

    // Calculate exponential delay
    let exponentialDelay = Math.min(base * Math.pow(2, retries), cap);

    // Calculate random jitter
    let jitter = Math.random() * exponentialDelay * randomFactor;

    // Apply jitter by randomly adding or subtracting it
    let waitInterval = Math.random() < 0.5 ? exponentialDelay - jitter : exponentialDelay + jitter;

    // Ensure the wait interval is not negative
    return Math.max(waitInterval, 0);
}

// Create a retry function that does not terminate while:
// - fun fails throwing an Error
// - retry returns true
// - it backs off using value return by timeout (in ms).
export function composeRetryUntil(fun,
                                  {
                                      timeout = exponentialBackoffWithJitter,
                                      retry = (error, i, ...args) => true,
                                      accept = (result, i, ...args) => true,
                                  } = {}) {

    if (Number.isInteger(retry)) {
        let max = retry;
        retry = (error, i) => i < max;
    }

    return async (...args) => {
        let err;
        let i = 0;
        let result;
        let done = false;
        do {
            try {
                err = null;
                result = await fun(...args);
                done = accept(result, i, ...args);
            } catch (e) {
                err = e;
                done = !retry(err, i, ...args);
            }
            if (!done) {
                i++;
                await asyncTimeout(timeout(i));
            } else {
                if (err) {
                    throw err;
                } else {
                    return result;
                }
            }
        }
        while (true);
    };
}

export function retry(fun, options, ...args) {
    return composeRetryUntil(fun, options)(...args);
}

export function noOp() {
}

export function identOp(arg) {
    return arg;
}

export class DebounceError extends Error {
    constructor(...args) {
        super(...args);
        this.name = "DebounceError";
    }
}

// debounce function: limits the rate at which a function can fire.
// The last call will have most priority.
export function debounce(callback) {
    let pending; // Variable to hold the pending invocation
    let running = false;

    return (...args) => {

        return new Promise(async (resolve, reject) => {
            // If there's a pending invocation and we're not ignoring rejects,
            // reject the previous invocation
            if (pending) {
                pending.reject(new DebounceError('debounced'));
            }

            // Set the current invocation as pending
            pending = {
                args, // arguments of the current invocation
                resolve, // resolve function for the current promise
                reject // reject function for the current promise
            };

            // If not already running, start processing
            if (!running) {
                running = true; // Set the running flag
                // Process each pending invocation
                while (pending) {
                    const {
                        args: currentArgs, // Arguments of the current pending invocation
                        resolve: currentResolve, // Resolve function of the current pending promise
                        reject: currentReject
                    } = pending;
                    pending = null; // Reset pending to null
                    // Execute the callback with current arguments and resolve the promise
                    try {
                        const result = await callback(...currentArgs);
                        currentResolve(result);
                    } catch (e) {
                        currentReject(e);
                    }

                    // if a call was pending while awaiting callback, loop
                }
                running = false; // Reset running flag after processing all invocations
            }
        });
    };
}


export function effect(callback) {
    let currentValue;
    return value => {
        if (value !== currentValue) {
            currentValue = value;
            callback(value);
        }
    }
}

export function toPromise(callback) {
    return new Promise((resolve, reject) => {
        callback(result => {
            if (result instanceof Error) {
                reject(result);
            } else {
                resolve(result);
            }
        });
    })
}