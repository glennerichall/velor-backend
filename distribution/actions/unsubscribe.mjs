import {getSubscriptions} from "../subscriber/getSubscriptions.mjs";
import {cleanSubscriptions} from "../subscriber/cleanSubscriptions.mjs";
import {getPubSub} from "../../application/services/backendServices.mjs";


export async function unsubscribe(services, transport, ...channels) {

    const pubSub = getPubSub(services);
    let subscriptions = getSubscriptions(transport, ...channels);

    let promises = [];
    for (let subscription of subscriptions) {
        let promise = pubSub.unsubscribe(subscription);
        promises.push(promise);
    }

    await Promise.all(promises);
    await cleanSubscriptions(subscriptions);

    return true;
}