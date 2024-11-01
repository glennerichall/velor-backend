import {publishPubSubMessage} from "../actions/publishPubSubMessage.mjs";
import {
    validateMessage
} from "velor-messaging/messaging/message/isMessage.mjs";
import {MESSAGE_TYPE_RPC_CALL} from "velor-messaging/messaging/constants.mjs";

import {getChannelForRpc} from "../channels.mjs";
import {
    getMessageBuilder,
    getPubSub, getRpcSignaling
} from "../../application/services/backendServices.mjs";

export async function submitRpcThroughPubSub(services, message, ...channels) {

    const rpc = getRpcSignaling(services);
    const pubSub = getPubSub(services);
    const messageBuilder = getMessageBuilder(services);
    let promise;

    validateMessage(message);

    if (message.type === MESSAGE_TYPE_RPC_CALL) {
        await pubSub.subscribeOnce(getChannelForRpc(message.info.id), data => {
            let message = messageBuilder.unpack(data);
            rpc.accept(message);
        });
        promise = rpc.getRpcSync(message.info);
    } else {
        promise = Promise.resolve();
    }

    await publishPubSubMessage(services, message, ...channels);
    return promise;
}