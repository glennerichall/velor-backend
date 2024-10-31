import {getSubscriptions} from "./getSubscriptions.mjs";
import {
    getChannelSet,
    getSubscriptionSet
} from "../subscriber/subscriber.mjs";
import {getPubSub} from "../../application/services/backendServices.mjs";

async function cleanSubscriptions(subscriptions) {
    let promises = [];
    // remove subscriptions from clients subscription references and call subscriptions unsubscribe listener.
    for (let subscription of subscriptions) {
        getSubscriptionSet(subscription.client).delete(subscription);
        getChannelSet(subscription.client).delete(subscription.channel);

        promises.push(subscription.onUnsubscribe?.call(subscription)
            .catch(e => {
                // do nothing about it, it just miserably failed
            }));
        await Promise.all(promises);
    }
}

export async function unsubscribeAll(pubSub, channels) {
    let subscriptions = [];

    // unsubscribe all subscriptions in channel
    let promises = [];
    for (let channel of channels) {
        let promise = pubSub.unsubscribe(channel);
        promises.push(promise);
    }
    let subscriptionsPerChannels = await Promise.all(promises);

    // multiple channels returning multiple subscriptions, flatten the sub-arrays.
    for (let set of subscriptionsPerChannels) {
        if (set) {
            subscriptions.push(...set);
        }
    }

    await cleanSubscriptions(subscriptions);
}

export async function unsubscribe(services, transport, ...channels) {
    const pubSub = getPubSub(services);
    let subscriptions = await getSubscriptions(transport, ...channels);

    let promises = [];
    for (let subscription of subscriptions) {
        let promise = pubSub.unsubscribe(subscription);
        promises.push(promise);
    }

    await Promise.all(promises);
    await cleanSubscriptions(subscriptions);

    return true;
}
