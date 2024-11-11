import {PubSubMessageFactory} from "../messaging/PubSubMessageFactory.mjs";
import {publishPubSubMessage} from "../actions/publishPubSubMessage.mjs";
import {getMessageBuilder} from "../../application/services/backendServices.mjs";

export async function requestSubscription(services, channelsToTarget, channelsToSubscribe) {
    const messageBuilder = getMessageBuilder(services);
    const message = new PubSubMessageFactory(messageBuilder).subscribe(...channelsToSubscribe);
    return publishPubSubMessage(services, message, ...channelsToTarget);
}
