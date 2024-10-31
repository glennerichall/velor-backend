const subscriptions = Symbol("subscriptions");
const channels = Symbol("channels");

export function getSubscriptionSet(subscriber) {
    return subscriber[subscriptions];
}

export function getChannelSet(subscriber) {
    return subscriber[channels];
}

export function createSubscriptionSet(subscriber) {
    subscriber[subscriptions] = new Set()
    subscriber[channels] = new Set();
}

export function addSubscription(subscriber, subscription, channel) {
    subscriber[subscriptions].add(subscription);
    subscriber[channels].add(channel);
}