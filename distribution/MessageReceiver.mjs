import {
    MESSAGE_TYPE_RPC_REJECT,
    MESSAGE_TYPE_RPC_REPLY,
    MESSAGE_TYPE_STREAM
} from "velor-messaging/messaging/constants.mjs";
import {getChannelForRpc, getChannelForStream} from "./channels.mjs";

export class MessageReceiver {
    #pubSub;

    constructor(pubSub) {
        this.#pubSub = pubSub;
    }

    onMessage(message) {
        let channel = this.getChannelForIncomingMessage(message);
        return this.#pubSub.publish(channel, message.buffer);
    }

    getChannelForIncomingMessage(message) {
        let channel;
        switch (message.type) {
            case MESSAGE_TYPE_RPC_REJECT:
            case MESSAGE_TYPE_RPC_REPLY:
                channel = getChannelForRpc(message.repliesTo);
                break;
            case MESSAGE_TYPE_STREAM:
                channel = getChannelForStream(message.streamId);
                break;
            default:
        }
        return channel;
    }
}