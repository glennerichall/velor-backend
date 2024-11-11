import {composePublishToPubSubClient} from "./composers/composePublishToPubSubClient.mjs";
import {
    getMessageBuilder,
    getPubSub,
    getRpcSignaling,
    getStreamHandler
} from "../application/services/backendServices.mjs";

export class ClientProviderPubSub {
    constructor() {
    }

    async getClients(...channels) {
        const pubSub = getPubSub(this);
        const rpc = getRpcSignaling(this);
        const messageBuilder = getMessageBuilder(this);
        const streamHandler = getStreamHandler(this);

        return composePublishToPubSubClient(services, ...channels);
    }

    async getClient(channel) {
        return this.getClients(channel);
    }
}
