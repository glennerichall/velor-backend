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
import sinon from "sinon";
import {getMessageBuilder} from "../application/services/backendServices.mjs";
import {initializeHmacSigning} from "velor-utils/utils/signature.mjs";
import {composeReceiveFromPubSubListenerPolicy} from "../distribution/composers/composeReceiveFromPubSubListener.mjs";
import {PubSubMessageFactory} from "../distribution/messaging/PubSubMessageFactory.mjs";

const {
    test,
    expect,
    beforeEach,
    describe,
    it,
    afterEach
} = setupTestContext();

describe("composeReceiveFromPubSubListener", () => {
    let services, composeReceiveFromPubSubListener, pubSub,
        handleControlMessage;

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

        handleControlMessage = sinon.stub();
        composeReceiveFromPubSubListener = composeReceiveFromPubSubListenerPolicy(handleControlMessage);
    })


    it('should send to transport if not a control', async () => {
        let transport = {
            send: sinon.stub()
        };
        let message = getMessageBuilder(services).newEvent(10);
        let receiveFromPubSubListener = composeReceiveFromPubSubListener(services, transport);
        await receiveFromPubSubListener(message);

        expect(handleControlMessage.notCalled).to.be.true;
        expect(transport.send.calledOnce).to.be.true;
        expect(transport.send.calledWith(message)).to.be.true;
    })

    it('should call handler if a control', async () => {
        let transport = {
            send: sinon.stub()
        };
        let message = new PubSubMessageFactory(getMessageBuilder(services)).subscribe('chan1');
        let receiveFromPubSubListener = composeReceiveFromPubSubListener(services, transport);
        await receiveFromPubSubListener(message);

        expect(handleControlMessage.calledOnce).to.be.true;
        expect(handleControlMessage.calledWith(services, transport, message)).to.be.true;
        expect(transport.send.notCalled).to.be.true;
    })

    it('should ignore a bad signature message', async () => {
        let transport = {
            send: sinon.stub()
        };
        let message = new PubSubMessageFactory(getMessageBuilder(services)).subscribe('chan1');
        message.info.signature = 'bad signature';
        let receiveFromPubSubListener = composeReceiveFromPubSubListener(services, transport);
        await receiveFromPubSubListener(message);

        expect(handleControlMessage.notCalled).to.be.true;
        expect(transport.send.notCalled).to.be.true;
    })

})