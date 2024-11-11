import {
    PUBSUB_CONTROL,
    PUBSUB_CONTROL_RESPONSE,
} from "../rpc/control.mjs";

import {PubSubMessageWrapper} from "./PubSubMessageWrapper.mjs";
import {MessageWrapperBase} from "velor-messaging/messaging/message/MessageWrapperBase.mjs";
import {signData} from "velor-utils/utils/signature.mjs";
import {signMessage} from "velor-messaging/messaging/message/signMessage.mjs";

import * as controls from "../rpc/control.mjs";

let controlNames = Object.keys(controls)
    .reduce((acc, key) => {
        acc[controls[key]] = key;
        return acc;
    }, {});

export class PubSubMessageBuilder {
    #builder;

    constructor(builder) {
        this.#builder = builder;
    }

    #adapt(message, data) {
        message.info.controlName = controlNames[message.info.messageMeta];
        message.info.data = data;
        return new PubSubMessageWrapper(signMessage(message));
    }

    #getOptions(options = {}) {
        const {
            createBuffer = size => {
                return new ArrayBuffer(size + 32);
            },
            ...otherOptions
        } = options;

        return {
            createBuffer,
            ...otherOptions
        };
    }

    newControlRequest(type, data, options) {
        options = this.#getOptions(options);
        let message = this.#builder.newVariant(PUBSUB_CONTROL, type, data, options);
        return this.#adapt(message, data);
    }

    newControlReply(message, data, options) {
        options = this.#getOptions(options);
        let replyTo = message.info.id;
        if (data instanceof MessageWrapperBase) {
            const info = data.info;
            return this.#builder.newMessage(info.dataType, PUBSUB_CONTROL_RESPONSE, replyTo, data.buffer, options);
        }
        let reply = this.#builder.newVariant(PUBSUB_CONTROL_RESPONSE, replyTo, data, options);
        return this.#adapt(reply);
    }

    unpack(buffer) {
        try {
            const sigLength = 32;
            const msgLength = buffer.byteLength - sigLength;
            const bufferWithoutSig = new DataView(buffer, 0, msgLength);
            const message = this.#builder.unpack(bufferWithoutSig);

            message.info.signature = Buffer.from(new Uint8Array(buffer, msgLength)).toString('hex');
            message.info.expectedSignature = Buffer.from(signData(bufferWithoutSig)).toString('hex');

            return new PubSubMessageWrapper(message, this.#builder);
        } catch (e) {
            // this message is not signed
            return this.#builder.unpack(buffer);
        }
    }
}