import {subscribeTransportToChannel} from "./subscribeTransportToChannel.mjs";


export async function subscribe(services, transport, ...channels) {

    channels = channels.filter(channel => !!channel);
    if (channels.length > 0) {
        let promises = [];
        for (let channel of channels) {
            let promise = subscribeTransportToChannel(services, transport, channel);
            promises.push(promise);
        }
        return await Promise.all(promises);
    }

    return [];
}

