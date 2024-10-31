// TODO this needs to be synchronised with all pending channel joining and quitting. We need to wait for a pending sub and unsub to terminate.
export async function getSubscriptionCount(pubSub, ...channels) {
    let count = 0;
    for (let channel of channels) {
        count += await pubSub.getSubscriptionCount(channel);
    }
    return count;
}