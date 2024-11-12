import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {MessageBuilder} from "velor-messaging/messaging/message/MessageBuilder.mjs";
import {createAppServicesInstance, getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {
    s_logger,
    s_messageBuilder,
    s_pubSub, s_rpcSignaling, s_sync
} from "../application/services/backendServiceKeys.mjs";
import {isClientSubscribed} from "../distribution/subscriber/isClientSubscribed.mjs";
import {LocalPubSub} from "../distribution/impl/LocalPubSub.mjs";
import {PubSubMixin} from "../distribution/impl/PubSubMixin.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import {
    getPubSub
} from "../application/services/backendServices.mjs";
import {initializeHmacSigning} from "velor-utils/utils/signature.mjs";
import {waitOnAsync} from 'velor-utils/test/waitOnAsync.mjs';
import {Synchronizer} from "velor-utils/utils/sync.mjs";
import {createRpcSignalingManager} from "../application/factories/createRpcSignalingManager.mjs";
import {ClientTrackerPubSub} from "../distribution/ClientTrackerPubSub.mjs";

const {
    test,
    describe,
    expect,
    beforeEach
} = setupTestContext();

describe("ClientTrackerPubSub", () => {
    let tracker, services, transport;

    beforeEach(async () => {
        initializeHmacSigning('a cat in the hat');
        services = createAppServicesInstance({
            factories: {
                [s_pubSub]: PubSubMixin(LocalPubSub),
                [s_messageBuilder]: MessageBuilder,
                [s_logger]: () => noOpLogger,
                [s_rpcSignaling]: createRpcSignalingManager,
                [s_sync]: Synchronizer
            }
        });
        transport = {};
        tracker = getServiceBinder(services).createInstance(ClientTrackerPubSub);
    })

    test('should subscribe a transport to pubsub channels', async () => {
        let chan1 = "chan1";
        let chan2 = "chan2";
        let chan3 = "chan3";

        // a transport object has a send method
        transport.send = () => {
        };

        await tracker.subscribe(transport, chan1, chan2);

        expect(isClientSubscribed(transport, chan1)).to.be.true;
        expect(isClientSubscribed(transport, chan2)).to.be.true;
        expect(isClientSubscribed(transport, chan3)).to.be.false;

        expect(await getPubSub(services).getSubscriptionCount(chan1)).to.be.equal(1);
        expect(await getPubSub(services).getSubscriptionCount(chan2)).to.be.equal(1);
        expect(await getPubSub(services).getSubscriptionCount(chan3)).to.be.equal(0);
    })

    test('should subscribe subscribers in channel to pubsub channels', async () => {
        let chan1 = "chan1";
        let chan2 = "chan2";

        // a transport object has a send method
        transport.send = () => {
        };

        await tracker.subscribe(transport, chan1);
        expect(isClientSubscribed(transport, chan1)).to.be.true;
        expect(isClientSubscribed(transport, chan2)).to.be.false;

        await tracker.subscribe(chan1, chan2);

        expect(isClientSubscribed(transport, chan1)).to.be.true;
        expect(isClientSubscribed(transport, chan2)).to.be.true;

        expect(await getPubSub(services).getSubscriptionCount(chan1)).to.be.equal(1);
        expect(await getPubSub(services).getSubscriptionCount(chan2)).to.be.equal(1);
    })

    test('should unsubscribe a transport from pubsub channels', async () => {
        let chan1 = "chan1";
        let chan2 = "chan2";

        // a transport object has a send method
        transport.send = () => {
        };

        await tracker.subscribe(transport, chan1, chan2);
        await tracker.unsubscribe(transport, chan1, chan2);

        expect(isClientSubscribed(transport, chan1)).to.be.false;
        expect(isClientSubscribed(transport, chan2)).to.be.false;
    })

    test('should unsubscribe subscribers in channel from pubsub channels', async () => {
        let chan1 = "chan1";
        let chan2 = "chan2";

        // a transport object has a send method
        transport.send = () => {
        };

        await tracker.subscribe(transport, chan1, chan2);
        await tracker.unsubscribe(chan1, chan2);

        expect(isClientSubscribed(transport, chan1)).to.be.true;

        await waitOnAsync(async () => {
            expect(isClientSubscribed(transport, chan2)).to.be.false;
        })

    })
})