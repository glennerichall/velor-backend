import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";

export function composeSendThroughServerClient(services, ...channels) {
    return {
        async send(message) {
            const api = getPubSubApi(services);
            return api.publish(message, ...channels);
        },

        submit(message) {
            throw new NotImplementedError();
        },

        read(message) {
            throw new NotImplementedError();
        }
    }

}
