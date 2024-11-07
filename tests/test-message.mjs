import {MessageBuilder,} from "velor-messaging/messaging/message/MessageBuilder.mjs";
import {PubSubMessageBuilder} from "../distribution/messaging/PubSubMessageBuilder.mjs";

import {PUBSUB_CONTROL_SUBSCRIBE} from "../distribution/rpc/control.mjs";

import {PubSubMessageWrapper} from "../distribution/messaging/PubSubMessageWrapper.mjs";
import {initializeHmacSigning} from "velor-utils/utils/signature.mjs";

import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";

const {test, expect} = setupTestContext();

test.describe('message', () => {
    let builder = new MessageBuilder();
    let pbuilder = new PubSubMessageBuilder(builder);

    test.beforeAll(() => {
        initializeHmacSigning('a cat in the hat');
    })

    test.describe('PubSubMessageBuilder', () => {
        test('should pack commands', () => {
            let {buffer} = pbuilder.newControlRequest(
                PUBSUB_CONTROL_SUBSCRIBE,
                {
                    channels: ['titi', 'tata']
                });

            expect(buffer).to.be.a('ArrayBuffer');

            let unpack = pbuilder.unpack(buffer);

            expect(unpack).to.be.an.instanceof(PubSubMessageWrapper);
            expect(unpack).to.have.property('isControl', true);

            expect(unpack.json()).to.deep.eq({
                channels: ['titi', 'tata']
            });

            expect(unpack.command).to.eq(PUBSUB_CONTROL_SUBSCRIBE);
        })

        test('should sign message', () => {
            let {buffer} = pbuilder.newControlRequest(
                PUBSUB_CONTROL_SUBSCRIBE,
                {
                    channels: ['titi', 'tata']
                });

            let unpack = pbuilder.unpack(buffer);
            expect(unpack.isSigned).to.be.true;
            expect(unpack.signature).to.be.a('string');
            expect(unpack.isSignatureValid).to.be.true;
        })
    })

})