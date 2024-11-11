import {composeSendThroughServerClient} from "./composers/composeSendThroughServerClient.mjs";
import {getServices} from "velor-services/injection/ServicesContext.mjs";

export class ClientProviderHttp {
    constructor() {
    }

    async getClients(...channels) {
        return composeSendThroughServerClient(getServices(this), ...channels)
    }

    async getClient(channel) {
        return this.getClients(channel);
    }
}