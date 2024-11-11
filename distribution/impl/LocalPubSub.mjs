import {SubscriptionIndex} from "./SubscriptionIndex.mjs";
import {getUuid} from "velor-services/injection/ServicesContext.mjs";
import {getLogger} from "velor-services/injection/services.mjs";
import {globToRegExp} from "velor-utils/utils/string.mjs";

export class LocalPubSub {
    constructor() {
        this._channels = new SubscriptionIndex();
    }

    // the methods are async to reflect any other cloud pubSub library like redis.
    async hasChannel(channel) {
        return this._channels.has(channel);
    }

    async subscribe(channel, onMessage) {
        getLogger(this).debug(`Subscribing channel "${channel}" in pubSub[${getUuid(this)}]`);
        return this._channels.add(channel, onMessage);
    }

    async unsubscribe(subscriptionOrChannel) {
        let subscriptions = await this._channels.remove(subscriptionOrChannel);
        for (let subscription of subscriptions) {
            getLogger(this).debug(`Unsubscribed channel "${subscription.channel}" in pubSub[${getUuid(this)}]`);
        }
        return subscriptions;
    }

    async getSubscriptions(channel) {
        return this._channels.getSubscriptions(channel);
    }

    async publish(channel, message) {
        if (this._channels.has(channel)) {
            let subscriptions = this._channels.get(channel);
            for (let {onMessage} of subscriptions) {
                onMessage(message);
            }
        } else {
            getLogger(this).debug(`No subscribers in channel "${channel}" for pubSub[${getUuid(this)}]`);
        }
    }

    async getSubscriptionCount(channel) {
        if (this._channels.has(channel)) {
            let subscriptions = this._channels.get(channel);
            return subscriptions.size;
        }
        return 0;
    }

    async getChannels() {
        return [...this._channels.keys()];
    }

    async clear() {
        this._channels.clear();
    }

    async findChannels(pattern) {
        let channels = [];
        if (!(pattern instanceof RegExp)) {
            pattern = globToRegExp(pattern);
        }
        for (let channel of await this.getChannels()) {
            if (pattern.test(channel)) {
                channels.push(channel);
            }
        }
        return channels;
    }
}