import {
    getChannelSet,
} from "../subscriber/subscriber.mjs";

export function isClientSubscribed(subscriber, channel) {
    return getChannelSet(subscriber)?.has(channel);
}