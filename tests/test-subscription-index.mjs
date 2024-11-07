import {SubscriptionIndex} from '../distribution/impl/SubscriptionIndex.mjs';
import {setupTestContext} from 'velor-utils/test/setupTestContext.mjs';

const {
    expect,
    describe,
    beforeEach,
    it
} = setupTestContext();

describe('SubscriptionIndex', () => {
    let subscriptionIndex;

    beforeEach(() => {
        subscriptionIndex = new SubscriptionIndex();
    });

    describe('constructor', () => {
        it('should initialize with an empty channel map', () => {
            expect([...subscriptionIndex.keys()]).to.be.empty;
        });
    });

    describe('has()', () => {
        it('should return false if channel does not exist', () => {
            expect(subscriptionIndex.has('nonexistent')).to.be.false;
        });

        it('should return true if channel exists', () => {
            subscriptionIndex.add('testChannel', () => {
            });
            expect(subscriptionIndex.has('testChannel')).to.be.true;
        });
    });

    describe('add()', () => {
        it('should add a new subscription to a channel', () => {
            const subscription = subscriptionIndex.add('testChannel', () => {
            });
            expect(subscriptionIndex.has('testChannel')).to.be.true;
            expect(subscriptionIndex.get('testChannel').has(subscription)).to.be.true;
        });

        it('should add multiple subscriptions to the same channel', () => {
            const onMessage1 = () => {
            };
            const onMessage2 = () => {
            };
            const subscription1 = subscriptionIndex.add('testChannel', onMessage1);
            const subscription2 = subscriptionIndex.add('testChannel', onMessage2);
            const subscriptions = subscriptionIndex.get('testChannel');

            expect(subscriptions.size).to.equal(2);
            expect(subscriptions.has(subscription1)).to.be.true;
            expect(subscriptions.has(subscription2)).to.be.true;
        });
    });

    describe('remove()', () => {
        it('should remove a specific subscription', () => {
            const onMessage1 = () => {
            };
            const subscription1 = subscriptionIndex.add('testChannel', onMessage1);

            const onMessage2 = () => {
            };
            const subscription2 = subscriptionIndex.add('testChannel', onMessage2);

            subscriptionIndex.remove(subscription1);

            expect(subscriptionIndex.get('testChannel').has(subscription1)).to.be.false;
            expect(subscriptionIndex.get('testChannel').has(subscription2)).to.be.true;
        });

        it('should remove all subscriptions when channel is removed by name', () => {
            subscriptionIndex.add('testChannel', () => {
            });
            subscriptionIndex.add('testChannel', () => {
            });
            subscriptionIndex.remove('testChannel');

            expect(subscriptionIndex.has('testChannel')).to.be.false;
            expect(subscriptionIndex.get('testChannel')).to.be.empty;
        });

        it('should return an empty set if trying to remove a non-existent channel', () => {
            const result = subscriptionIndex.remove('nonexistentChannel');
            expect(result).to.be.instanceOf(Set);
            expect(result.size).to.equal(0);
        });
    });

    describe('get()', () => {
        it('should return a set of subscriptions for a channel', () => {
            const subscription = subscriptionIndex.add('testChannel', () => {
            });
            const subscriptions = subscriptionIndex.get('testChannel');

            expect(subscriptions).to.be.instanceOf(Set);
            expect(subscriptions.has(subscription)).to.be.true;
        });

        it('should return an empty set for a non-existent channel', () => {
            const subscriptions = subscriptionIndex.get('nonexistentChannel');
            expect(subscriptions).to.be.instanceOf(Set);
            expect(subscriptions.size).to.equal(0);
        });
    });

    describe('keys()', () => {
        it('should return an iterator over the channel names', () => {
            subscriptionIndex.add('testChannel1', () => {
            });
            subscriptionIndex.add('testChannel2', () => {
            });
            const keys = [...subscriptionIndex.keys()];

            expect(keys).to.include('testChannel1');
            expect(keys).to.include('testChannel2');
        });
    });

    describe('clear()', () => {
        it('should remove all channels and subscriptions', () => {
            subscriptionIndex.add('testChannel1', () => {
            });
            subscriptionIndex.add('testChannel2', () => {
            });
            subscriptionIndex.clear();

            expect([...subscriptionIndex.keys()]).to.be.empty;
        });
    });
});
