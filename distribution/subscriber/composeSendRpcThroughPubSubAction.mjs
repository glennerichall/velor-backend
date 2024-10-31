import {PubSubMessageFactory} from "../messaging/PubSubMessageFactory.mjs";
import {getMessageBuilder} from "../../application/services/backendServices.mjs";

export function composeSendRpcThroughPubSubAction(services, prop, submit) {
    return async (...args) => {
        let message = new PubSubMessageFactory(getMessageBuilder(services))
            .callMethod(prop, args);
        return submit(message);
    }
}