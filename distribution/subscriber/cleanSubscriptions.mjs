import {
    getChannelSet,
    getSubscriptionSet
} from "./subscriber.mjs";

export async function cleanSubscriptions(subscriptions) {
    let promises = [];
    // remove subscriptions from clients subscription references and call subscriptions unsubscribe listener.
    for (let subscription of subscriptions) {
        getSubscriptionSet(subscription.client).delete(subscription);
        getChannelSet(subscription.client).delete(subscription.channel);

        let res = Promise.resolve(subscription.onUnsubscribe?.call(subscription))
            .catch(e => {
                // do nothing about it, it just miserably failed
            });
        promises.push(res);
        await Promise.all(promises);
    }
}