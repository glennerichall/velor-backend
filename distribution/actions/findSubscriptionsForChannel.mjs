export function findSubscriptionsForChannel(subscriptions, channel) {
    let matching = [];
    for (let subscription of subscriptions) {
        if (subscription.channel === channel) {
            matching.push(subscription);
        }
    }
    return matching;
}