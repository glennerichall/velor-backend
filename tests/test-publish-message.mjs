import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {publishPubSubMessage} from "../distribution/actions/publishPubSubMessage.mjs";
import {MessageBuilder} from "velor-messaging/messaging/message/MessageBuilder.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {
    s_logger,
    s_messageBuilder,
    s_pubSub
} from "../application/services/backendServiceKeys.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import sinon from "sinon";

const {
    test,
    describe,
    expect,
    beforeEach
} = setupTestContext();

describe('publishPubSubMessage', () => {

    let pubSubMock, services;

    beforeEach(() => {

        services = createAppServicesInstance({
            factories: {
                [s_pubSub]: () => pubSubMock = {
                    publish: sinon.stub()
                },
                [s_messageBuilder]: MessageBuilder,
                [s_logger]: () => noOpLogger
            }
        });

    });

    test('it should validate the messages before publishing', async ({}) => {
        const dummyMessage = 'Invalid message'; // assume this is not a valid message

        let err;
        try {
            await publishPubSubMessage(services, dummyMessage, 'channel1');
        } catch (e) {
            err = e;
        }
        expect(err).to.exist;
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.eq("message must have a buffer property of type ArrayBuffer");
    });

    test('it should return promises for all publishing actions', async ({}) => {
        const validMessage = new MessageBuilder().newEmpty();

        await publishPubSubMessage(services, validMessage, 'channel1', 'channel2');

        // Check that PubSub's publish was called twice (for two channels):
        expect(pubSubMock.publish.calledTwice).to.be.true;

        // Check that PubSub's publish was called with correct arguments:
        expect(pubSubMock.publish.getCall(0).args).to.deep.equal(['channel1', validMessage.buffer]);
        expect(pubSubMock.publish.getCall(1).args).to.deep.equal(['channel2', validMessage.buffer]);
    });

    test('publishing to no channels should not call publish on pubSub', async ({}) => {
        const validMessage = new MessageBuilder().newEmpty();

        await publishPubSubMessage(services, validMessage);

        // Check that PubSub's publish was not called:
        expect(pubSubMock.publish.called).to.be.false;
    });

});
