import {SubscriptionIndex} from "./SubscriptionIndex.mjs";

export class RedisPubSub {
    constructor(redis) {
        this._redis = redis;
        this._subscriber = redis.duplicate();
        this._publisher = redis.duplicate();
        this._channels = new SubscriptionIndex();
    }

    async connect() {
        await this._subscriber.connect();
        await this._publisher.connect();
    }

    async subscribe(channel, onMessage) {
        await this._subscriber.subscribe(channel, onMessage);
        return this._channels.add(channel, onMessage);
    }

    async unsubscribe(subscriptionOrChannel) {
        let subscriptions = this._channels.remove(subscriptionOrChannel);
        let promises = [];
        for (let {channel, onMessage} of subscriptions) {
            let promise = this._subscriber.unsubscribe(channel, onMessage);
            promises.push(promise);
        }
        await Promise.all(promises);
        return subscriptions;
    }

    async getSubscriptions(channel) {
        return this._channels.get(channel);
    }

    async findChannels(pattern) {
        const result = await this._redis.pubSubChannels(pattern);
        return result;
    }

    async publish(channel, message) {
        return this._publisher.publish(channel, message);
    }

    async getSubscriptionCount(channel) {
        // const result = await this._redis.sendCommand(['PUBSUB', 'NUMSUB', channel]);
        const result = await this._redis.pubSubNumSub(channel);
        return result;
    }

    async getChannels() {
        const result = await this._redis.pubSubChannels();
        return result;
    }

    async clear() {
        await this._subscriber.unsubscribe();
        await this._channels.clear();
    }
}