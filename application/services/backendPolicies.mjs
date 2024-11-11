import {
    getMessageBuilder,
    getPubSub,
    getRpcSignaling,
    getStreamHandler
} from "./backendServices.mjs";

export function getBackendServicesProvider(policy = {}) {

    return {
        getPubSub,
        getRpcSignaling,
        getMessageBuilder,
        getStreamHandler,
        ...policy
    };
}