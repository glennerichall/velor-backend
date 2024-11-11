import {
    PUBSUB_CONTROL_CALL,
    PUBSUB_CONTROL_SUBSCRIBE,
    PUBSUB_CONTROL_UNSUBSCRIBE
} from "../control.mjs";
import {getLogger} from "velor-services/injection/services.mjs";
import {handleControlRpc} from "./handleControlRpc.mjs";
import {handleControlSubscribe} from "./handleControlSubscribe.mjs";
import {handleControlUnsubscribe} from "./handleControlUnsubscribe.mjs";

export async function handleControlMessage(services, subscriber, control) {
        const handlers = {
            [PUBSUB_CONTROL_CALL]: handleControlRpc,
            [PUBSUB_CONTROL_SUBSCRIBE]: handleControlSubscribe,
            [PUBSUB_CONTROL_UNSUBSCRIBE]: handleControlUnsubscribe,
        };

        const handler = handlers[control.command];

        if (handler) {
            try {
                return await handler(services, subscriber, control);
            } catch (e) {
                getLogger(services).error('Unable to handle control message', control, e);
            }
        }
    }
