import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {
    addSubscription,
    createSubscriptionSet,
    getChannelSet,
    getSubscriptionSet
} from "../distribution/subscriber/subscriber.mjs";

import {cleanSubscriptions} from "../distribution/subscriber/cleanSubscriptions.mjs";
import {getSubscriptions} from "../distribution/subscriber/getSubscriptions.mjs";
import {isClientSubscribed} from "../distribution/subscriber/isClientSubscribed.mjs";
import {subscribeTransportToChannel} from "../distribution/actions/subscribeTransportToChannel.mjs";

const {
    test,
    expect
} = setupTestContext();

test.describe('Subscriber', () => {
    let services, subscriber, channel, subscription, onMessage, onUnsubscribe;

    test.beforeEach(() => {
        services = {}; // Dummy services object
        subscriber = {}; // Dummy subscriber object
        channel = 'TestChannel'; // Dummy channel string
        subscription = {
            client: subscriber,
            channel: channel,
            onUnsubscribe: () => {},
        }; // Dummy subscription object
        onMessage = () => {}; // Dummy function
        onUnsubscribe = () => {}; // Dummy function
    });

    test('should create subscription set', async () => {
        createSubscriptionSet(subscriber);
        expect(getSubscriptionSet(subscriber)).to.be.a('Set');
        expect(getSubscriptionSet(subscriber)).to.be.empty;
        expect(getChannelSet(subscriber)).to.be.a('Set');
        expect(getChannelSet(subscriber)).to.be.empty;
    });

    test('should add subscription', async () => {
        let channelBefore = getChannelSet(subscriber);
        let subscriptionBefore = getSubscriptionSet(subscriber);
        createSubscriptionSet(subscriber);
        addSubscription(subscriber, subscription, channel);
        expect(getChannelSet(subscriber)).to.not.deep.equal(channelBefore);
        expect(getSubscriptionSet(subscriber)).to.not.deep.equal(subscriptionBefore);

        expect(getChannelSet(subscriber)).to.include(channel);
        expect(getSubscriptionSet(subscriber)).to.include(subscription);
    });

    test('should return correct subscription', async () => {
        createSubscriptionSet(subscriber);
        addSubscription(subscriber, subscription, channel);
        expect(getSubscriptions(subscriber, channel)).to.include(subscription);
    });

    test('should confirm client subscription correctly', async () => {
        createSubscriptionSet(subscriber);
        addSubscription(subscriber, subscription, channel);
        expect(isClientSubscribed(subscriber, channel)).to.be.true;
        expect(isClientSubscribed(subscriber, 'dummy')).to.be.false;
    });

    test('subscribeTransportToChannel should return correct result', async () => {
        createSubscriptionSet(subscriber);
        addSubscription(subscriber, subscription, channel);
        let wasSubscribed = await subscribeTransportToChannel(services, subscriber, channel, onUnsubscribe);
        expect(wasSubscribed).to.be.false;
    });

    test('getSubscriptions should return full set when no channels passed', async () => {
        createSubscriptionSet(subscriber);
        addSubscription(subscriber, subscription, channel);

        let subscriptions = await getSubscriptions(subscriber);
        expect(subscriptions).to.include(subscription);
    });

    test('getSubscriptions should return correct subscription when single channel passed', async () => {
        createSubscriptionSet(subscriber);
        addSubscription(subscriber, subscription, channel);

        let subscriptions = await getSubscriptions(subscriber, channel);
        expect(subscriptions).to.include(subscription);
    });

    test('getSubscriptions should return correct subscriptions when multiple channels passed', async () => {
        let channel2 = 'TestChannel2';
        let subscription2 = {
            client: subscriber,
            channel: channel2,
            onUnsubscribe: () => {},
        };

        createSubscriptionSet(subscriber);
        addSubscription(subscriber, subscription, channel);
        addSubscription(subscriber, subscription2, channel2);

        let subscriptions = await getSubscriptions(subscriber, channel, channel2);
        expect(subscriptions).to.include(subscription);
        expect(subscriptions).to.include(subscription2);
    });

    test.describe('cleanSubscriptions', ()=> {
        let services, subscriber, channel, subscription, onMessage, onUnsubscribe;

        test.beforeEach(() => {
            services = {}; // Dummy services object
            subscriber = {}; // Dummy subscriber object
            channel = 'TestChannel'; // Dummy channel string
            subscription = {
                client: subscriber,
                channel: channel,
                onUnsubscribe: () => {},
            }; // Dummy subscription object
            onMessage = () => {}; // Dummy function
            onUnsubscribe = () => {}; // Dummy function
        });

        test('should clean subscriptions', async () => {
            createSubscriptionSet(subscriber);
            addSubscription(subscriber, subscription, channel);
            await cleanSubscriptions(getSubscriptionSet(subscriber));
            expect(getSubscriptionSet(subscriber)).to.be.empty;
            expect(getChannelSet(subscriber)).to.be.empty;
        });


        test('cleanSubscriptions should call onUnsubscribe (returning promise)', async () => {
            let onUnsubscribeCalled = false;
            subscription.onUnsubscribe = async () => { onUnsubscribeCalled = true; };

            createSubscriptionSet(subscriber);
            addSubscription(subscriber, subscription, channel);

            await cleanSubscriptions(getSubscriptions(subscriber));
            expect(onUnsubscribeCalled).to.be.true;
        });

        test('cleanSubscriptions should call onUnsubscribe (not returning a promise)', async () => {
            let onUnsubscribeCalled = false;
            subscription.onUnsubscribe = () => { onUnsubscribeCalled = true; };

            createSubscriptionSet(subscriber);
            addSubscription(subscriber, subscription, channel);

            await cleanSubscriptions(getSubscriptions(subscriber));
            expect(onUnsubscribeCalled).to.be.true;
        });

        test('cleanSubscriptions should handle onUnsubscribe being undefined', async () => {
            subscription.onUnsubscribe = undefined;

            createSubscriptionSet(subscriber);
            addSubscription(subscriber, subscription, channel);

            expect(async () => {
                await cleanSubscriptions(getSubscriptions(subscriber));
            }).to.not.throw();
        });

    })
});