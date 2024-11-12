import {getChannelForRpc} from "../channels.mjs";
import {
    getMessageBuilder,
    getPubSub
} from "../../application/services/backendServices.mjs";
import {getLogger} from "velor-services/injection/services.mjs";

export async function replyToRequest(services, message, response) {
    const pubSub = getPubSub(services);
    const messageBuilder = getMessageBuilder(services);
    let data = messageBuilder.newReply(message, response).buffer;
    try {
        return await pubSub.publish(
            getChannelForRpc(message.id),
            data
        );
    } catch (e) {
        getLogger(services).error('Unable to send reply ' + e.message);
    }
}

export async function rejectToRequest(services, message, error) {
    const pubSub = getPubSub(services);
    const messageBuilder = getMessageBuilder(services);
    const data = messageBuilder.newRejection(message, error).buffer;
    try {
        return pubSub.publish(
            getChannelForRpc(message.id),
            data
        );
    } catch (e) {
        getLogger(services).error('Unable to send rejection ' + e.message);
    }
}
