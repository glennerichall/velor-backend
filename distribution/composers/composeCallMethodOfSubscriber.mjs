import {PubSubMessageFactory} from "../messaging/PubSubMessageFactory.mjs";
import {getMessageBuilder} from "../../application/services/backendServices.mjs";
import {submitRpcThroughPubSub} from "../rpc/submitRpcThroughPubSub.mjs";


export function composeCallMethodOfSubscriber(services, prop, channels) {
    const messageBuilder = getMessageBuilder(services);

    return async (...args) => {
        let message = new PubSubMessageFactory(messageBuilder).callMethod(prop, args);
        return submitRpcThroughPubSub(services, message, ...channels);
    }
}

