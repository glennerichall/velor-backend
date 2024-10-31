import {composeAutoSendMessageFactoryProvider} from "./composeAutoSendMessageFactoryProvider.mjs";
import {forUserId} from "../../distribution/channels/matchingRules.mjs";


import {getClientTracker} from "../../../server/application/services/serverServices.mjs";

export function composeAutoSendMessageFactoryProviderForUserId(services) {
    const getAutoSendMessageFactory = composeAutoSendMessageFactoryProvider(services);
    return async userId => {
        let clients = await getClientTracker(services).getClients(forUserId(userId));
        return getAutoSendMessageFactory(clients);
    }
}