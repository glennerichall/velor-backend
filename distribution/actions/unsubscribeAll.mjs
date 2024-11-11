import {cleanSubscriptions} from "../subscriber/cleanSubscriptions.mjs";
import {getPubSub} from "../../application/services/backendServices.mjs";

export async function unsubscribeAll(services, channels) {
    let subscriptions = [];
    const pubSub = getPubSub(services);

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

