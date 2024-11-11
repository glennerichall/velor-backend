import {MessageBuilder,} from "velor-messaging/messaging/message/MessageBuilder.mjs";
import {PubSubMessageBuilder} from "../distribution/messaging/PubSubMessageBuilder.mjs";

import {PUBSUB_CONTROL_SUBSCRIBE} from "../distribution/rpc/control.mjs";

import {PubSubMessageWrapper} from "../distribution/messaging/PubSubMessageWrapper.mjs";
import {initializeHmacSigning} from "velor-utils/utils/signature.mjs";

import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";
import {
    mockDate,
    resetDate
} from 'velor-utils/test/mockDate.mjs';

const {test, expect} = setupTestContext();

test.describe('message', () => {
    let builder = new MessageBuilder(undefined, {
        getId: () => 10
    });
    let pbuilder = new PubSubMessageBuilder(builder);

    test.beforeAll(() => {
        initializeHmacSigning('a cat in the hat');
    })

    test.afterEach(() => {
        resetDate();
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
            mockDate('2024-10-28');
            let {buffer} = pbuilder.newControlRequest(
                PUBSUB_CONTROL_SUBSCRIBE,
                {
                    channels: ['titi', 'tata']
                });

            let unpack = pbuilder.unpack(buffer);
            expect(unpack.isSigned).to.be.true;
            expect(unpack.signature).to.be.a('string');
            expect(unpack.isSignatureValid).to.be.true;

            expect(unpack.signature).to.eq("e23347990710bd63a74d97cbd6cd935973f08ee457fad9264dd7fbf4572a12a6");

        })
    })
})