import {
    getProvider
} from "velor/utils/injection/baseServices.mjs";

import {
    s_clientProvider,
    s_database,
    s_keyStore,
    s_messageBuilder,
    s_messageFactory,
    s_messageQueue,
    s_pubSub,
} from "./backendServiceKeys.mjs";

export function getDatabase(services) {
    return getProvider(services)[s_database]();
}

export function getMessageQueue(services) {
    return getProvider(services)[s_messageQueue]();
}

export function getKeyStore(services) {
    return getProvider(services)[s_keyStore]();
}

export function getMessageBuilder(services) {
    return getProvider(services)[s_messageBuilder]();
}

export function getMessageFactory(services) {
    return getProvider(services)[s_messageFactory]();
}

export function getClientProvider(services) {
    return getProvider(services)[s_clientProvider]();
}

export function getPubSub(services) {
    return getProvider(services)[s_pubSub]();
}