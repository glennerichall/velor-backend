import {composePublishToPubSubClient} from "./subscriber/composePublishToPubSubClient.mjs";
import {getServices} from "velor-utils/utils/injection/ServicesContext.mjs";

export class ClientProviderPubSub {
    constructor() {}

    async getClients(...channels) {
        return composePublishToPubSubClient(getServices(this), ...channels);
    }

    async getClient(channel) {
        return this.getClients(channel);
    }
}