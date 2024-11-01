import {MessageWrapperBase} from "velor-messaging/messaging/message/MessageWrapperBase.mjs";
import {PUBSUB_CONTROL} from "../rpc/control.mjs";


export class PubSubMessageWrapper extends MessageWrapperBase {
    constructor(...args) {
        super(...args);
    }

    get isSigned() {
        return true;
    }

    get signature() {
        return this.info.signature;
    }

    get isSignatureValid() {
        return this.signature === this.info.expectedSignature;
    }

    get isControl() {
        return this.type === PUBSUB_CONTROL;
    }

    get command() {
        return this.info.messageMeta;
    }

    get repliesTo() {
        return this.info.messageMeta;
    }
}