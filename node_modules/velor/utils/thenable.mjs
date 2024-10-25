// Wraps a promise and returns a Proxy object that allows
// chaining of property accesses and function calls after the promise resolves.

const thenableSymbol = Symbol("thenable");

export function isThenable(value) {
    return value[thenableSymbol];
}

export const retry = Symbol("retry");

export const thenable = (promise, fromProp) => {
    const handler = {
        get(target, prop, receiver) {
            // If the property accessed is 'then', return a function that resolves or rejects the original promise.
            if (prop === 'then') {
                return (resolve, reject) => {
                    return Promise.resolve(promise)
                        .then(res => resolve(res))
                        .catch(e => reject(e));
                }

            } else if (prop === thenableSymbol) {
                return true;

            } else if (prop === 'catch') {
                return capture => Promise.resolve(promise).catch(capture);
            }

            // If it's another property, return a new thenable that resolves
            // with the value of the accessed property once the promise resolves.
            return thenable(
                Promise.resolve(promise).then(x => {
                    let val = x[prop]; // Get the property from the resolved value.
                    if (typeof val === 'function' && !isThenable(val)) {
                        val = (...args) => x[prop](...args); // Bind functions to the resolved object
                    }
                    return val; // Return the property or bound function.
                }), prop);
        },

        // Intercept function calls on the proxy object.
        apply(target, thisArg, argumentList) {
            // Return a new thenable that resolves with the result of the function call
            // once the promise resolves, passing the arguments.
            return thenable(
                Promise.resolve(promise).then(x => {
                    if (x === undefined) {
                        throw new Error(`Function '${fromProp}' does not exist`);
                    }
                    const res = x(...argumentList); // Call the resolved value (which should be a function).
                    return res; // Return the result of the function call.
                })
            );
        }
    }

    // Create a Proxy object that intercepts function calls and property access using the defined handler.
    const proxy = new Proxy(() => {
    }, handler);

    return proxy;
}
