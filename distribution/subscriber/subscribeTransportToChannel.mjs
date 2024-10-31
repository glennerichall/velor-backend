import {isClientSubscribed} from "../actions/isClientSubscribed.mjs";
import {composeReceiveFromPubSubListener} from "./composeReceiveFromPubSubListener.mjs";
import {
    addSubscription,
    createSubscriptionSet,
    getSubscriptionSet
} from "./subscriber.mjs";
import {getPubSub} from "../../application/services/backendServices.mjs";

export async function subscribeTransportToChannel(services, transport, channel, onUnsubscribe) {
    // already subscribe to channel, do not allow multiple subscriptions in one channel.
    if (isClientSubscribed(transport, channel)) {
        return false;
    }

    const pubSub = getPubSub(services);

    if (!getSubscriptionSet(transport)) {
        createSubscriptionSet(transport);
    }

    // A publication handler is a function that receives messages from a particular channel, the one
    // that is currently subscribe in this case.
    const onMessage = composeReceiveFromPubSubListener(services, transport);
    let subscription = await pubSub.subscribe(channel, onMessage);

    // client keep reference to its subscriptions so wsTracker can unsubscribe all channels when a client
    // disconnects
    addSubscription(transport, subscription, channel);

    // subscription keeps reference to subscribed client so wsTracker can remove client's reference to it when
    // a channel is unsubscribed for all.
    subscription.client = transport;

    // subscription keeps also a reference to any unsubscription listeners passed to ws tracker when adding a
    // client into a channel
    subscription.onUnsubscribe = onUnsubscribe;

    return true;
}