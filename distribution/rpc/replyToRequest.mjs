import {
    getChannelForRpc
} from "../channels/channels.mjs";
import {
    getMessageBuilder,
    getPubSub
} from "../../application/services/backendServices.mjs";

export function replyToRequest(services, message, response) {
    const pubSub = getPubSub(services);
    const messageBuilder = getMessageBuilder(services);

    return pubSub.publish(
        getChannelForRpc(message.id),
        messageBuilder.newReply(message, response).buffer,
    );
}