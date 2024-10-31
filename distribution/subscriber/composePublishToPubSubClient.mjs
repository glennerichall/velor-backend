import {publishPubSubMessage} from "../actions/publishPubSubMessage.mjs";
import {submitRpcThroughPubSub} from "../rpc/submitRpcThroughPubSub.mjs";
import {readStream} from "../rpc/readStream.mjs";
import {requestSubscription} from "../rpc/requestSubscription.mjs";
import {requestUnsubscription} from "../rpc/requestUnsubscription.mjs";
import {composeSendRpcThroughPubSubAction} from "./composeSendRpcThroughPubSubAction.mjs";

function isCallable(prop) {
    return prop !== "then";
}

// This is an adapter that connects the client transport to the pub sub system. It sends the
// messages through the pub sub.
export function composePublishToPubSubClient(services, ...channels) {

    // send to all clients using publish subscribe pattern
    const send = message => publishPubSubMessage(services, message, ...channels);

    // submit rpc call to all clients using pub sub
    const submit = (message) => submitRpcThroughPubSub(services, message, ...channels);

    // read a stream
    const read = (type, data) => readStream(services, type, data, ...channels);

    // subscribe clients to channels
    const subscribe = (...channelsToSubscribe) => requestSubscription(services, channels, channelsToSubscribe);

    // unsubscribe clients from channels
    const unsubscribe = (...channelsToSubscribe) => requestUnsubscription(services, channels, channelsToSubscribe);

    return new Proxy({}, {
        get(target, prop, receiver) {
            if (prop === "send") {
                return send;

            } else if (prop === "submit") {
                return submit;

            } else if (prop === "read") {
                return read;

            } else if (prop === "subscribe") {
                return subscribe;

            } else if (prop === "unsubscribe") {
                return unsubscribe;

            } else if (isCallable(prop)) {
                // invoke a remote procedure call (rpc) on the client transport
                return composeSendRpcThroughPubSubAction(services, prop, submit);
            }
            return undefined;
        }
    });
}