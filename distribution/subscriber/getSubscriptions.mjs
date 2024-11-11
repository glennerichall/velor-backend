import {findSubscriptionsForChannel} from "./findSubscriptionsForChannel.mjs";
import {getSubscriptionSet} from "./subscriber.mjs";

export function getSubscriptions(subscriber, ...channels) {
    let subscriptions;

    if (channels.length > 0) {
        subscriptions = channels.flatMap(channel =>
            findSubscriptionsForChannel(getSubscriptionSet(subscriber), channel));
    } else {
        subscriptions = getSubscriptionSet(subscriber) ?? new Set();
    }

    return subscriptions;
}