import {
    validateMessage
} from "velor-messaging/messaging/message/isMessage.mjs";

import {getPubSub} from "../../application/services/backendServices.mjs";

export function publishPubSubMessage(services, message, ...channels) {
    let promises = [];

    validateMessage(message);

    const pubSub = getPubSub(services);

    for (let channel of channels) {
        let promise = pubSub.publish(channel, message.buffer);
        promises.push(promise);
    }
    return Promise.all(promises);
}