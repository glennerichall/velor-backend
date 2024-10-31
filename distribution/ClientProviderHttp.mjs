import {composeSendThroughServerClient} from "./subscriber/composeSendThroughServerClient.mjs";
import {getServices} from "velor/utils/injection/ServicesContext.mjs";

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