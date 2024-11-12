import {composePublishToPubSubClient} from "./composers/composePublishToPubSubClient.mjs";

export class ClientProviderPubSub {

    async getClients(...channels) {
        return composePublishToPubSubClient(this, ...channels);
    }

    async getClient(channel) {
        return this.getClients(channel);
    }
}
