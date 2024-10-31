import {
    getPubSubApi
} from "../../../worker/application/services/workerServices.mjs";
import {NotImplementedError} from "velor/utils/errors/NotImplementedError.mjs";

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