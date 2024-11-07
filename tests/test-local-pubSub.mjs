import {LocalPubSub} from "../distribution/impl/LocalPubSub.mjs";

import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('local pubsub', () => {
    test('should subscribe and unsubscribe', async () => {
        let pubSub = new LocalPubSub();

        let onMessage = () => {
        };
        let subscription1 = await pubSub.subscribe('/toto/tata', onMessage);
        let subscription2 = await pubSub.subscribe('/toto/tata', onMessage);

        // multiple subscriptions for the same channel and same callback should be possible
        expect(subscription1).to.not.be.null;
        expect(subscription2).to.not.be.null;
        expect(subscription1).to.not.eq(subscription2);

        // unsubscription must only remove current subscription
        let subscription3 = await pubSub.unsubscribe(subscription1);
        expect(subscription3).to.have.length(1);
        expect(subscription3).to.include(subscription1);
        expect(subscription3).to.not.eq(subscription2);

        // unsubscription of not subscribe subscription must not be allowed
        let subscription4 = await pubSub.unsubscribe(subscription1);
        expect(subscription4).to.be.empty;

        let subscription5 = await pubSub.unsubscribe(null);
        expect(subscription5).to.be.empty;
    })

    test('should unsubscribe a full channel', async () => {
        let pubSub = new LocalPubSub();

        let onMessage = () => {
        };
        let subscription1 = await pubSub.subscribe('/toto/tata', onMessage);
        let subscription2 = await pubSub.subscribe('/toto/tata', onMessage);
        let subscription3 = await pubSub.subscribe('/toto/tata', onMessage);

        let subscription4 = await pubSub.unsubscribe('/toto/titi');
        expect(subscription4).to.be.empty;

        // unsubscription of all 3 in channel
        let subscriptions = await pubSub.unsubscribe('/toto/tata');
        expect(subscriptions).to.not.be.null;
        expect(subscriptions).to.have.length(3);

        expect(subscriptions).to.include(subscription1);
        expect(subscriptions).to.include(subscription2);
        expect(subscriptions).to.include(subscription3);
    })

    test('should publish', async () => {
        let pubSub = new LocalPubSub();

        let receivedMessage1;
        let onMessage1 = (message) => {
            receivedMessage1 = message;
        };

        let receivedMessage2 = "";
        let onMessage2 = (message) => {
            receivedMessage2 += message;
        };
        let subscription1 = await pubSub.subscribe('/toto/tata', onMessage1);

        // same handler for the two subscriptions, the messages will be concatenated
        let subscription2 = await pubSub.subscribe('/toto/tata', onMessage2);
        let subscription3 = await pubSub.subscribe('/toto/tata', onMessage2);

        await pubSub.publish('/toto/tata', 'a toto then a tata');
        expect(receivedMessage1).to.eq('a toto then a tata');

        // the messages will be concatenated
        expect(receivedMessage2).to.eq('a toto then a tata' + 'a toto then a tata');
    })

    test('should not publish if unsubscribed', async () => {
        let pubSub = new LocalPubSub();

        let receivedMessage1;
        let onMessage1 = (message) => {
            receivedMessage1 = message;
        };

        let receivedMessage2 = 'tatata';
        let onMessage2 = (message) => {
            receivedMessage2 = message;
        };
        let subscription1 = await pubSub.subscribe('/toto/tata', onMessage1);
        let subscription2 = await pubSub.subscribe('/toto/tata', onMessage2);
        await pubSub.unsubscribe(subscription2);

        await pubSub.publish('/toto/tata', 'a toto then a tata');
        expect(receivedMessage1).to.eq('a toto then a tata');
        expect(receivedMessage2).to.eq('tatata');
    })

});