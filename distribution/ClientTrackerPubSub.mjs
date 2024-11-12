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

    async subscribe(channelOrTransport, ...channelsToSubscribe) {
        if (isTransport(channelOrTransport)) {
            return await subscribe(getServices(this), channelOrTransport, ...channelsToSubscribe);
        } else if (typeof channelOrTransport === "string") {
            return await requestSubscription(getServices(this),
                [channelOrTransport], channelsToSubscribe);
        } else {
            throw new Error('channelOrTransport must be on object with a send method or a channel string')
        }
    }

    async unsubscribe(channelOrTransport, ...channelsToSubscribe) {
        if (isTransport(channelOrTransport)) {
            return await unsubscribe(getPubSub(this), channelOrTransport,
                ...channelsToSubscribe);
        } else if (typeof channelOrTransport === "string") {
            return await requestUnsubscription(getServices(this),
                [channelOrTransport], channelsToSubscribe);
        } else {
            throw new Error('channelOrTransport must be on object with a send method or a channel string')
        }
    }

    async getSubscriptionCount(...channels) {
        return await getSubscriptionCount(getPubSub(this), ...channels)
    }
}

