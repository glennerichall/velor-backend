import {PubSubMixin} from "../distribution/impl/PubSubMixin.mjs";
import {LocalPubSub} from "../distribution/impl/LocalPubSub.mjs";

import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";

const {
    test
} = setupTestContext();

test.describe('PubSubMixin', () => {

    test('should listen to subscriptions', async () => {
        return new Promise(async (resolve, reject) => {
            const pubSub = new (PubSubMixin(LocalPubSub))();
            await pubSub.initialize();

            pubSub.onSubscription(event => {
                const {
                    action,
                    channel
                } = event;
                if (action === 'subscribe' && channel === '/toto/tata') {
                    resolve();
                } else {
                    reject(new Error('bad event'));
                }
            });

            pubSub.subscribe('/toto/tata', () => {
            });
        })
    })

    test('should listen to un-subscriptions', async () => {
        return new Promise(async (resolve, reject) => {
            const pubSub = new (PubSubMixin(LocalPubSub))();
            await pubSub.initialize();
            pubSub.subscribe('/toto/tata', () => {
            }).then(x => {
                pubSub.onSubscription(event => {
                    const {
                        action,
                        channel
                    } = event;
                    if (action === 'unsubscribe' && channel === '/toto/tata') {
                        resolve();
                    } else {
                        reject(new Error('bad event'));
                    }
                });
                pubSub.unsubscribe(x);
            });
        })
    })

})