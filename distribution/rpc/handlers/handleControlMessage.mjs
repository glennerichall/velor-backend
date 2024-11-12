import {
    PUBSUB_CONTROL_CALL,
    PUBSUB_CONTROL_SUBSCRIBE,
    PUBSUB_CONTROL_UNSUBSCRIBE
} from "../control.mjs";
import {getLogger} from "velor-services/injection/services.mjs";
import {handleControlRpc} from "./handleControlRpc.mjs";
import {handleControlSubscribe} from "./handleControlSubscribe.mjs";
import {handleControlUnsubscribe} from "./handleControlUnsubscribe.mjs";
import {rejectToRequest, replyToRequest} from "../replyToRequest.mjs";

const defaultHandlers = {
    [PUBSUB_CONTROL_CALL]: handleControlRpc,
    [PUBSUB_CONTROL_SUBSCRIBE]: handleControlSubscribe,
    [PUBSUB_CONTROL_UNSUBSCRIBE]: handleControlUnsubscribe,
};

export const handleControlMessagePolicy = (handlers = defaultHandlers) =>
    async (services, subscriber, control) => {

        const handler = handlers[control.command];

        if (handler) {
            try {
                let result = await handler(services, subscriber, control);
                await replyToRequest(services, control, result);
            } catch (error) {
                getLogger(services).error(`Control call ${control.command} failed with error ` + error.message);
                await rejectToRequest(services, control, error.message);
            }
        } else {
            getLogger(services).error('Unable to handle control message as no handler exists for ' + control.command);
        }
    }

export const handleControlMessage = handleControlMessagePolicy();
