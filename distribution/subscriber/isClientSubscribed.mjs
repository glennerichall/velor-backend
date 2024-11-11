import {
    getChannelSet,
} from "./subscriber.mjs";

export function isClientSubscribed(subscriber, channel) {
    return getChannelSet(subscriber)?.has(channel);
}