import {createProxyAutoSendResultOnCall} from "velor/utils/composers/createProxyAutoSendResultOnCall.mjs";

import {getMessageFactory} from "../services/backendServices.mjs";

export function composeAutoSendMessageFactoryProvider(services) {
    return clients => {
        let messageFactory = getMessageFactory(services);
        return createProxyAutoSendResultOnCall(messageFactory, clients);
    };
}