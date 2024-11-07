import {getChannelForSubscriptions,} from "../channels.mjs";
import {EmitterMixin} from "velor-utils/utils/Emitter.mjs";


export const PubSubMixin = Clazz => class extends EmitterMixin(Clazz) {
    #onSubscription;

    constructor(...args) {
        super(...args);
        this.#onSubscription = null;
    }

    async initialize() {
        this.#onSubscription = await super.subscribe(getChannelForSubscriptions(),
            message => this.emit('subscription', message));
    }

    async release() {
        await super.unsubscribe(this.#onSubscription);
    }

    onSubscription(listener) {
        return this.on("subscription", listener);
    }

    async subscribe(channel, onMessage) {
        const subscription = await super.subscribe(channel, onMessage);
        await super.publish(getChannelForSubscriptions(), {channel, action: 'subscribe'});
        return subscription;
    }

    async subscribeOnce(channel, onMessage) {
        const subscription = await this.subscribe(channel, message => {
            try {
                onMessage(message);
            } finally {
                this.unsubscribe(subscription);
            }
        });
        return subscription;
    }

    async unsubscribe(subscriptionOrChannel) {
        let eventChannel = getChannelForSubscriptions();
        const subscriptions = await super.unsubscribe(subscriptionOrChannel);
        await Promise.all(
            [...new Set([...subscriptions].map(x => x.channel))]    // only keep unique channels
                .map(channel =>                                     // publish to subscription observing channel
                    super.publish(eventChannel, {
                        channel,
                        action: 'unsubscribe'
                    })));
        return subscriptions;
    }
}