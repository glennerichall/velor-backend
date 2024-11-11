import {isClientSubscribed} from "../subscriber/isClientSubscribed.mjs";
import {
    addSubscription,
    createSubscriptionSet,
    getSubscriptionSet
} from "../subscriber/subscriber.mjs";
import {getPubSub} from "../../application/services/backendServices.mjs";
import {composeReceiveFromPubSubListener} from "../composers/composeReceiveFromPubSubListener.mjs";

export async function subscribeTransportToChannel(services, transport, channel, onUnsubscribe = null) {

    // already subscribe to channel, do not allow multiple subscriptions in one channel.
    if (isClientSubscribed(transport, channel)) {
        return false;
    }

    if (!getSubscriptionSet(transport)) {
        createSubscriptionSet(transport);
    }

    const pubSub = getPubSub(services);

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