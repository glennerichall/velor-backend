import {composePublishToPubSubClient} from "../distribution/composers/composePublishToPubSubClient.mjs";

import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {createAppServicesInstance, getServiceBinder} from "velor-services/injection/ServicesContext.mjs";
import {
    s_logger,
    s_messageBuilder,
    s_pubSub,
    s_rpcSignaling,
    s_sync
} from "../application/services/backendServiceKeys.mjs";
import {PubSubMixin} from "../distribution/impl/PubSubMixin.mjs";
import {LocalPubSub} from "../distribution/impl/LocalPubSub.mjs";
import {MessageBuilder} from "velor-messaging/messaging/message/MessageBuilder.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import {
    getMessageBuilder,
    getPubSub
} from "../application/services/backendServices.mjs";
import sinon from "sinon";
import {waitOnAsync} from 'velor-utils/test/waitOnAsync.mjs';
import {subscribe} from "../distribution/actions/subscribe.mjs";
import {createRpcSignalingManager} from "../application/factories/createRpcSignalingManager.mjs";
import {Synchronizer} from "velor-utils/utils/sync.mjs";
import {getChannelForRpc} from "../distribution/channels.mjs";
import {isClientSubscribed} from "../distribution/subscriber/isClientSubscribed.mjs";
import {initializeHmacSigning} from "velor-utils/utils/signature.mjs";
import {ClientProviderPubSub} from "../distribution/ClientProviderPubSub.mjs";

const {
    test,
    expect,
    beforeEach
} = setupTestContext();

test.describe("composePublishToPubSubClient", () => {

    let services, client;

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

        let provider = getServiceBinder(services).createInstance(ClientProviderPubSub);
        client = await provider.getClient("chan1");

    });

    test("should send message", async () => {
        let message = getMessageBuilder(services).newEvent(12);

        let transport = {
            send: sinon.stub()
        };
        await subscribe(services, transport, "chan1");

        await client.send(message);

        await waitOnAsync(async () => {
            expect(transport.send.calledOnce).to.be.true;
            let args = transport.send.args[0];
            let message = args[0];
            expect(message.isEvent).to.be.true;
            expect(message.event).to.eq(12);
        });
    })

    test("should submit rpc message", async () => {
        let message = getMessageBuilder(services).newCommand(12);

        let transport = {
            send(message) {
                let channelResponse = getChannelForRpc(message.info.id);
                let response = getMessageBuilder(services).newReply(message, 'baz');
                getPubSub(services).publish(channelResponse, response.buffer);
            }
        };

        await subscribe(services, transport, "chan1");

        let response = await client.submit(message);

        expect(response.isReply).to.be.true;
        expect(response.isString).to.be.true;
        expect(response.string()).to.eq('baz');

    })

    test("should subscribe to channel", async () => {
        let transport = {};
        await subscribe(services, transport, "chan1");

        await client.subscribe("chan2");

        waitOnAsync(async () => {
            expect(isClientSubscribed(transport, "chan2")).to.be.true;
        })
    })

    test("should unsubscribe from channel", async () => {
        let transport = {};
        await subscribe(services, transport, "chan1");
        await subscribe(services, transport, "chan2");

        await client.unsubscribe("chan2");

        waitOnAsync(async () => {
            expect(isClientSubscribed(transport, "chan2")).to.be.false;
        })
    })

    test("should call method on remote subscriber", async () => {
        let transport = {
            remoteProcedure: sinon.stub().withArgs(1, 4, 'foo').returns("baz")
        };
        await subscribe(services, transport, "chan1");

        await client.remoteProcedure(1, 4, 'foo');

        expect(transport.remoteProcedure.calledOnce).to.be.true;
        expect(transport.remoteProcedure.calledWith(1, 4, 'foo')).to.be.true;
    })

    test("should call method on remote subscriber and received result", async () => {
        let transport = {
            remoteProcedure: sinon.stub().returns("baz")
        };
        await subscribe(services, transport, "chan1");

        let response = await client.remoteProcedure(1, 4, 'foo');

        expect(response.isReply).to.be.true;
        expect(response.isString).to.be.true;
        expect(response.string()).to.eq('baz');
    })
})