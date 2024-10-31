import {findSubscriptionsForChannel} from "./findSubscriptionsForChannel.mjs";
import {getSubscriptionSet} from "../subscriber/subscriber.mjs";

export async function getSubscriptions(subscriber, ...channels) {
    let subscriptions;

    if (channels.length > 0) {
        subscriptions = channels.flatMap(channel =>
            findSubscriptionsForChannel(getSubscriptionSet(subscriber), channel));
    } else {
        subscriptions = getSubscriptionSet(subscriber) ?? new Set();
    }

    return subscriptions;
}