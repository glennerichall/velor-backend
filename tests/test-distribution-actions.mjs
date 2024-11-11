import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {publishPubSubMessage} from "../distribution/actions/publishPubSubMessage.mjs";
import {MessageBuilder} from "velor-messaging/messaging/message/MessageBuilder.mjs";
import {createAppServicesInstance} from "velor-services/injection/ServicesContext.mjs";
import {
    s_logger,
    s_messageBuilder,
    s_pubSub
} from "../application/services/backendServiceKeys.mjs";
import {subscribe} from "../distribution/actions/subscribe.mjs";
import {isClientSubscribed} from "../distribution/subscriber/isClientSubscribed.mjs";
import {LocalPubSub} from "../distribution/impl/LocalPubSub.mjs";
import {PubSubMixin} from "../distribution/impl/PubSubMixin.mjs";
import {noOpLogger} from "velor-utils/utils/noOpLogger.mjs";
import {
    getMessageBuilder,
    getPubSub
} from "../application/services/backendServices.mjs";
import sinon from "sinon";
import {PubSubMessageFactory} from "../distribution/messaging/PubSubMessageFactory.mjs";
import {initializeHmacSigning} from "velor-utils/utils/signature.mjs";
import {waitOnAsync} from 'velor-utils/test/waitOnAsync.mjs';

const {
    test,
    describe,
    expect,
    beforeEach
} = setupTestContext();

describe('distribution actions', () => {

    let pubSubMock, services;

    beforeEach(() => {

        services = createAppServicesInstance({
            factories: {
                [s_pubSub]: PubSubMixin(LocalPubSub),
                [s_messageBuilder]: MessageBuilder,
                [s_logger]: () => noOpLogger
            }
        });

    });

    describe('publishPubSubMessage', () => {
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
            expect(pubSubMock.publish.called).to.be.false; // PubSub's publish should not be called due to invalid message
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
    })

    describe('subscribe', () => {
        let transport, control, builder;

        beforeEach(() => {
            initializeHmacSigning('a cat in the hat');
            transport = {};
            builder = getMessageBuilder(services);
            control = new PubSubMessageFactory(builder);
        })

        test('should subscribe to pubsub channels', async () => {
            let chan1 = "chan1";
            let chan2 = "chan2";
            let chan3 = "chan3";
            await subscribe(services, transport, chan1, chan2);

            expect(isClientSubscribed(transport, chan1)).to.be.true;
            expect(isClientSubscribed(transport, chan2)).to.be.true;
            expect(isClientSubscribed(transport, chan3)).to.be.false;

            expect(await getPubSub(services).getSubscriptionCount(chan1)).to.be.equal(1);
            expect(await getPubSub(services).getSubscriptionCount(chan2)).to.be.equal(1);
            expect(await getPubSub(services).getSubscriptionCount(chan3)).to.be.equal(0);

        })

        test('should subscribe twice to pubsub channels', async () => {
            let chan1 = "chan1";
            let chan2 = "chan2";
            let chan3 = "chan3";
            await subscribe(services, transport, chan1, chan3);
            let [ok1, ok2] = await subscribe(services, transport, chan1, chan2);

            expect(ok1).to.be.false;
            expect(ok2).to.be.true;

            expect(await getPubSub(services).getSubscriptionCount(chan1)).to.be.equal(1);
            expect(await getPubSub(services).getSubscriptionCount(chan2)).to.be.equal(1);
            expect(await getPubSub(services).getSubscriptionCount(chan3)).to.be.equal(1);
        })

        test('should send to transport on publication', async () => {
            let chan1 = "chan1";
            let chan3 = "chan3";

            transport.send = sinon.stub();

            await subscribe(services, transport, chan1, chan3);

            let message = getMessageBuilder(services).newEvent(5);

            await getPubSub(services).publish(chan1, message.buffer);

            expect(transport.send.calledOnce).to.be.true;

            let expected = new Uint8Array(message.buffer);

            expect(transport.send.calledWith(sinon.match(arg =>
                arg.buffer instanceof ArrayBuffer))).to.be.true;

            expect(transport.send.calledWith(sinon.match(arg =>
                new Uint8Array(arg.buffer).every(
                    (value, i) => value === expected[i]))))
                .to.be.true;
        })


        test('should allow requesting subscription through pubsub', async () => {
            let chan1 = "chan1";
            let chan2 = "chan2";
            let chan3 = "chan3";

            transport.send = sinon.stub();

            await subscribe(services, transport, chan1);
            let message = control.subscribe(chan2, chan3);

            expect(message.isSigned).to.be.true;
            expect(message.isControl).to.be.true;

            expect(isClientSubscribed(transport, chan2)).to.be.false;
            expect(isClientSubscribed(transport, chan3)).to.be.false;

            await getPubSub(services).publish(chan1, message.buffer);

            await waitOnAsync(async () => {
                expect(isClientSubscribed(transport, chan2)).to.be.true;
                expect(isClientSubscribed(transport, chan3)).to.be.true;
            });

        })

        test('should allow requesting unsubscription through pubsub', async () => {
            let chan1 = "chan1";
            let chan2 = "chan2";

            transport.send = sinon.stub();

            await subscribe(services, transport, chan1, chan2);
            let message = control.unsubscribe(chan2);

            expect(isClientSubscribed(transport, chan1)).to.be.true;
            expect(isClientSubscribed(transport, chan2)).to.be.true;

            await getPubSub(services).publish(chan1, message.buffer);

            await waitOnAsync(async () => {
                expect(isClientSubscribed(transport, chan2)).to.be.false;
                expect(isClientSubscribed(transport, chan1)).to.be.true;
            });

        })

        test('should allow calling rpc through pubsub', async () => {
            let chan1 = "chan1";

            transport.send = sinon.stub();
            transport.remoteProcedure = sinon.stub().returns('bar');

            await subscribe(services, transport, chan1);
            let message = control.callMethod('remoteProcedure', [1, 4, 'foo']);

            await getPubSub(services).publish(chan1, message.buffer);

            await waitOnAsync(async () => {
                return transport.remoteProcedure.calledOnce &&
                    transport.remoteProcedure.calledWith(1, 4, 'foo');
            });

        })

    })


});
