import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {
    s_logger,
    s_messageBuilder,
    s_pubSub,
    s_rpcSignaling,
    s_sync
} from "../application/services/backendServiceKeys.mjs";
import {MessageBuilder} from "velor-messaging/messaging/message/MessageBuilder.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import {createRpcSignalingManager} from "../application/factories/createRpcSignalingManager.mjs";
import {
    Synchronizer,
} from "velor-utils/utils/sync.mjs";
import {
    PUBSUB_CONTROL_CALL,
    PUBSUB_CONTROL_SUBSCRIBE,
    PUBSUB_CONTROL_UNSUBSCRIBE
} from "../distribution/rpc/control.mjs";
import sinon from "sinon";
import {handleControlMessage, handleControlMessagePolicy} from "../distribution/rpc/handlers/handleControlMessage.mjs";
import {getMessageBuilder, getPubSub} from "../application/services/backendServices.mjs";
import {PubSubMessageFactory} from "../distribution/messaging/PubSubMessageFactory.mjs";
import {initializeHmacSigning} from "velor-utils/utils/signature.mjs";
import {getChannelForRpc} from "../distribution/channels.mjs";
import {PubSubMessageBuilder} from "../distribution/messaging/PubSubMessageBuilder.mjs";

const {
    test,
    expect,
    beforeEach,
    describe,
    it,
    afterEach
} = setupTestContext();


describe("handleControlMessage", () => {
    let services, handlers, handleControlMessage, pubSub;

    beforeEach(async () => {
        initializeHmacSigning('a cat in the hat');
        services = createAppServicesInstance({
            factories: {
                [s_pubSub]: () => pubSub = {
                    publish: sinon.stub()
                },
                [s_messageBuilder]: MessageBuilder,
                [s_logger]: () => noOpLogger,
                [s_rpcSignaling]: createRpcSignalingManager,
                [s_sync]: () => new Synchronizer(700)

            }
        });

        handlers = {};

        handlers[PUBSUB_CONTROL_CALL] = sinon.stub();
        handlers[PUBSUB_CONTROL_SUBSCRIBE] = sinon.stub();
        handlers[PUBSUB_CONTROL_UNSUBSCRIBE] = sinon.stub();

        handleControlMessage = handleControlMessagePolicy(handlers);
    });

    it('should handle control message', async () => {
        const messageBuilder = getMessageBuilder(services);
        const message = new PubSubMessageFactory(messageBuilder).callMethod("method", "args");
        const transport = {};
        await handleControlMessage(services, transport, message);

        expect(handlers[PUBSUB_CONTROL_CALL].calledOnce).to.be.true;
        expect(handlers[PUBSUB_CONTROL_CALL].calledWith(services, transport, message)).to.be.true;
    })

    it('should handle subscribe message', async () => {
        const messageBuilder = getMessageBuilder(services);
        const message = new PubSubMessageFactory(messageBuilder).subscribe("chan1", "chan2");
        const transport = {};
        await handleControlMessage(services, transport, message);

        expect(handlers[PUBSUB_CONTROL_SUBSCRIBE].calledOnce).to.be.true;
        expect(handlers[PUBSUB_CONTROL_SUBSCRIBE].calledWith(services, transport, message)).to.be.true;
    })

    it('should handle unsubscribe message', async () => {
        const messageBuilder = getMessageBuilder(services);
        const message = new PubSubMessageFactory(messageBuilder).unsubscribe("chan1", "chan2");
        const transport = {};
        await handleControlMessage(services, transport, message);

        expect(handlers[PUBSUB_CONTROL_UNSUBSCRIBE].calledOnce).to.be.true;
        expect(handlers[PUBSUB_CONTROL_UNSUBSCRIBE].calledWith(services, transport, message)).to.be.true;
    })

    it('should not throw if no handler of control', async () => {
        const messageBuilder = getMessageBuilder(services);
        const message = new PubSubMessageBuilder(messageBuilder).newControlRequest(-1, 'foo');
        const transport = {};
        await handleControlMessage(services, transport, message);
    })

    it('should not throw if reply transmission fails', async () => {
        const messageBuilder = getMessageBuilder(services);
        const message = new PubSubMessageFactory(messageBuilder).unsubscribe("chan1", "chan2");
        const transport = {};
        getPubSub(services).publish.throws(new Error('baf'));
        await handleControlMessage(services, transport, message);
    })

    it('should not throw if rejection transmission fails', async () => {
        const messageBuilder = getMessageBuilder(services);
        const message = new PubSubMessageFactory(messageBuilder).unsubscribe("chan1", "chan2");
        const transport = {};
        handlers[PUBSUB_CONTROL_UNSUBSCRIBE].throws(new Error('baz'));
        getPubSub(services).publish.throws(new Error('baf'));
        await handleControlMessage(services, transport, message);
    })

    it('should reply request', async () => {
        const messageBuilder = getMessageBuilder(services);
        const message = new PubSubMessageFactory(messageBuilder).subscribe("chan1");
        const transport = {};

        handlers[PUBSUB_CONTROL_SUBSCRIBE].returns('bax');
        await handleControlMessage(services, transport, message);

        expect(pubSub.publish.calledOnce).to.be.true;
        let args = pubSub.publish.args[0];

        expect(args).to.have.length(2);

        expect(args[0]).to.eq(getChannelForRpc(message.info.id));

        let reply = messageBuilder.unpack(args[1]);

        expect(reply.isReply).to.be.true;
        expect(reply.string()).to.eq('bax');

    })

    it('should reject request if handling failed', async () => {
        const messageBuilder = getMessageBuilder(services);
        const message = new PubSubMessageFactory(messageBuilder).subscribe("chan1");
        const transport = {};

        handlers[PUBSUB_CONTROL_SUBSCRIBE].throws(new Error('bazzz'));
        await handleControlMessage(services, transport, message);

        expect(pubSub.publish.calledOnce).to.be.true;
        let args = pubSub.publish.args[0];

        expect(args).to.have.length(2);

        expect(args[0]).to.eq(getChannelForRpc(message.info.id));

        let reply = messageBuilder.unpack(args[1]);

        expect(reply.isRejection).to.be.true;
        expect(reply.error).to.be.an.instanceOf(Error);
        expect(reply.error.message).to.equal('bazzz');

    })
})