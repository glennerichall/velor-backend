import {getSubscriptionCount} from "./actions/getSubscriptionCount.mjs";
import {requestSubscription} from "./rpc/requestSubscription.mjs";
import {requestUnsubscription} from "./rpc/requestUnsubscription.mjs";
import {unsubscribe} from "./actions/unsubscribe.mjs";
import {subscribe} from "./actions/subscribe.mjs";
import {ClientProviderPubSub} from "./ClientProviderPubSub.mjs";
import {getServices} from "velor-services/injection/ServicesContext.mjs";
import {getPubSub} from "../application/services/backendServices.mjs";

export function isTransport(transportOrId) {
    return typeof transportOrId?.send === 'function';
}
export class ClientTrackerPubSub extends ClientProviderPubSub {

    async subscribe(transportOrId, ...channelsToSubscribe) {
        if (isTransport(transportOrId)) {
            return await subscribe(getServices(this), transportOrId, ...channelsToSubscribe);
        } else {
            return await requestSubscription(getServices(this),
                [getChannelForWsId(transportOrId)], channelsToSubscribe);
        }
    }

    async unsubscribe(transportOrId, ...channelsToSubscribe) {
        if (isTransport(transportOrId)) {
            return await unsubscribe(getPubSub(this), transportOrId,
                ...channelsToSubscribe);
        } else {
            return await requestUnsubscription(getServices(this),
                [getChannelForWsId(transportOrId)], channelsToSubscribe);
        }
    }

    async getSubscriptionCount(...channels) {
        return await getSubscriptionCount(getPubSub(this), ...channels)
    }
}

