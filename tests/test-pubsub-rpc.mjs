import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
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
import {subscribe} from "../distribution/actions/subscribe.mjs";
import {createRpcSignalingManager} from "../application/factories/createRpcSignalingManager.mjs";
import {
    Synchronizer,
    TimeoutError
} from "velor-utils/utils/sync.mjs";
import {submitRpcThroughPubSub} from "../distribution/rpc/submitRpcThroughPubSub.mjs";
import {
    getMessageBuilder,
    getPubSub
} from "../application/services/backendServices.mjs";
import {getChannelForRpc} from "../distribution/channels.mjs";
import sinon from "sinon";
import {waitOnAsync} from 'velor-utils/test/waitOnAsync.mjs';

const {
    test,
    expect,
    beforeEach
} = setupTestContext();

test.describe("submitRpcThroughPubSub", () => {

    let services;

    beforeEach(async () => {
        services = createAppServicesInstance({
            factories: {
                [s_pubSub]: PubSubMixin(LocalPubSub),
                [s_messageBuilder]: MessageBuilder,
                [s_logger]: () => noOpLogger,
                [s_rpcSignaling]: createRpcSignalingManager,
                [s_sync]: () => new Synchronizer(500)

            }
        });

    });

    test('should submit rpc through pubsub', async () => {
        let transport = {
            send: sinon.stub()
        };

        await subscribe(services, transport, "chan1");

        let message = getMessageBuilder(services).newCommand(12);
        submitRpcThroughPubSub(services, message, "chan1");

        await waitOnAsync(async () => {
            expect(transport.send.calledOnce).to.be.true;
            expect(transport.send.calledWith(message)).to.be.true;
        })

    })

    test('should receive rpc result', async () => {
        let transport = {
            send(message) {
                let channelResponse = getChannelForRpc(message.info.id);
                let response = getMessageBuilder(services).newReply(message, 'baz');
                getPubSub(services).publish(channelResponse, response.buffer);
            }
        };

        await subscribe(services, transport, "chan1");

        let message = getMessageBuilder(services).newCommand(12);
        let response = await submitRpcThroughPubSub(services, message, "chan1");

        expect(response.isReply).to.be.true;
        expect(response.isString).to.be.true;
        expect(response.string()).to.eq('baz');
    })


    test('should timeout rpc submission', async () => {
        let message = getMessageBuilder(services).newCommand(12);
        let error;
        try {
            await submitRpcThroughPubSub(services, message, "chan1");
        } catch (e) {
            error = e;
        }
        expect(error).to.be.an.instanceof(TimeoutError);
    })

    test('should validate message', async () => {
        let error;
        try {
            await submitRpcThroughPubSub(services, 'foo', "chan1");
        } catch (e) {
            error = e;
        }
        expect(error).to.be.an.instanceof(Error);
        expect(error.message).to.eq("message must have a buffer property of type ArrayBuffer");
    })
});