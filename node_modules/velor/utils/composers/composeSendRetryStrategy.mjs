import {
    composeRetryUntil,
    exponentialBackoffWithJitter
} from "../functional.mjs";

export function composeSendRetryStrategy(retryStrategy, send) {

    let {
        signal,
        timout = exponentialBackoffWithJitter,
        retry,
        accept
    } = retryStrategy;

    // If the request can be aborted
    if (signal) {

        // If retry is specified as a maximum number of retries
        if (Number.isInteger(retry)) {
            let max = retry;
            retry = (error, i) => i < max && !signal.aborted;
        }

        // If retry is a function, then combine the signal with it
        else if (typeof retry === 'function') {
            let retryTarget = retry;
            retry = (...args) => retryTarget(...args) && !signal.aborted;
        }

        // Retry is not specified, it is only defined from signal
        else {
            retry = () => !signal.aborted
        }
    }


    // If no signal to abort or no retry strategy is defined, then user does not
    // want to retry the request if it fails. Run it as is.
    if (!signal && !retry) {
        return send;
    }

    // last chance to check if the request was aborted before sending the request
    if (signal && signal.aborted) {
        throw new Error('The request was aborted before sending it');
    }

    return composeRetryUntil(send, {
        timout,
        retry,
        accept,
    });
}