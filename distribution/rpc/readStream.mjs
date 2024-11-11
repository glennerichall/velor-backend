import {MessageWrapper} from "velor-messaging/messaging/message/MessageWrapper.mjs";
import {getChannelForStream} from "../channels.mjs";

import {getLogger} from "velor-services/injection/services.mjs";
import {
    getMessageBuilder,
    getPubSub,
    getStreamHandler
} from "../../application/services/backendServices.mjs";


export async function readStream(services, type, data, ...channels) {

    const streamHandler = getStreamHandler(services);
    const pubSub = getPubSub(services);
    const messageBuilder = getMessageBuilder(services);

    const {reader, fail, id} = await streamHandler.createReadStream();
    try {
        let subscription = await pubSub.subscribe(getChannelForStream(id), data => {
            let message = messageBuilder.unpack(data);
            streamHandler.append(message);
        });

        reader.on('end', () => pubSub.unsubscribe(subscription));

        let message = messageBuilder.newCommand(RPC_REQUEST_STREAM, {type, streamId: id, data});

        await submitRpcThroughPubSub(services, message, ...channels);
    } catch (e) {
        let error;
        if (e instanceof Error) {
            error = e;
        } else if (e instanceof MessageWrapper) {
            error = e.error;
        } else {
            // wtf ???
            return;
        }
        getLogger(services).error(error.message);
        fail(error);
    }
    return reader;
}
