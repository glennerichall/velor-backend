import {PubSubMessageFactory} from "../messaging/PubSubMessageFactory.mjs";
import {getMessageBuilder} from "../../application/services/backendServices.mjs";


export function composeSendRpcThroughPubSubAction(services, prop, send) {
    const messageBuilder = getMessageBuilder(services);

    return async (...args) => {
        let message = new PubSubMessageFactory(messageBuilder)
            .callMethod(prop, args);
        return send(message);
    }
}

