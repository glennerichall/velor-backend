import {publishPubSubMessage} from "../actions/publishPubSubMessage.mjs";
import {validateMessage} from "velor-messaging/messaging/message/isMessage.mjs";

import {getChannelForRpc} from "../channels.mjs";
import {
    getMessageBuilder,
    getPubSub,
    getRpcSignaling
} from "../../application/services/backendServices.mjs";
import {getLogger} from "velor-services/injection/services.mjs";

export async function submitRpcThroughPubSub(services, message, ...channels) {

    const pubSub = getPubSub(services);
    const rpc = getRpcSignaling(services);
    const messageBuilder = getMessageBuilder(services);

    let promise;

    validateMessage(message);

    let replyChannel = getChannelForRpc(message.info.id);
    let subscription = await pubSub.subscribe(replyChannel, data => {
        let message = messageBuilder.unpack(data);
        rpc.accept(message);
    });

    try {
        promise = rpc.getRpcSync(message.info);
        await publishPubSubMessage(services, message, ...channels);
        return await promise;
    } finally {
        pubSub.unsubscribe(subscription)
            .catch(e => {
                getLogger(services).error("Unable to unsubscribe from rpc reply channel with error " + e.message);
            });
    }
}
