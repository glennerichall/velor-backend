import {
    PUBSUB_CONTROL_CALL,
    PUBSUB_CONTROL_SUBSCRIBE,
    PUBSUB_CONTROL_UNSUBSCRIBE
} from "./control.mjs";
import {handleControlRpc} from "./handleControlRpc.mjs";
import {handleControlSubscribe} from "./handleControlSubscribe.mjs";
import {handleControlUnsubscribe} from "./handleControlUnsubscribe.mjs";
import {getLogger} from "velor-utils/utils/injection/services.mjs";

const handlers = {
    [PUBSUB_CONTROL_CALL]: handleControlRpc,
    [PUBSUB_CONTROL_SUBSCRIBE]: handleControlSubscribe,
    [PUBSUB_CONTROL_UNSUBSCRIBE]: handleControlUnsubscribe,
};

export async function handleControlMessage(services, transport, control) {
    const handler = handlers[control.command];
    if (handler) {
        try {
            return await handler(services, transport, control);
        } catch (e) {
            getLogger(services).error('Unable to handle control message', control, e);
        }
    }
}