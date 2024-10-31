export class SubscriptionIndex {
    #channels;
    
    constructor() {
        this.#channels = new Map();
    }

    has(channel) {
        return this.#channels.has(channel);
    }

    add(channel, onMessage) {
        if (!this.#channels.has(channel)) {
            this.#channels.set(channel, new Set());
        }
        let subscription = {
            channel,
            onMessage
        };
        this.#channels.get(channel).add(subscription);
        return subscription;
    }

    remove(subscriptionOrChannel) {
        let subscriptions;
        if (typeof subscriptionOrChannel === 'string') {
            let channel = subscriptionOrChannel;
            if (this.#channels.has(channel)) {
                subscriptions = this.#channels.get(channel);
                this.#channels.delete(channel);
            } else {
                subscriptions = new Set();
            }
        } else {
            subscriptions = new Set();
            // ignore null subscriptions.
            let subscription = subscriptionOrChannel ?? {};
            let {
                channel,
            } = subscription;

            if (this.#channels.has(channel)) {
                let currentSubscriptions = this.#channels.get(channel);

                if (currentSubscriptions.has(subscription)) {
                    currentSubscriptions.delete(subscription);
                    if (currentSubscriptions.size === 0) {
                        this.#channels.delete(channel);
                    }
                    // only one subscription required to subscribe
                    subscriptions.add(subscription);
                }
            }
        }
        return subscriptions;
    }

    get(channel) {
        return new Set(this.#channels.get(channel));
    }

    keys() {
        return this.#channels.keys();
    }

    clear() {
        this.#channels.clear();
    }
}