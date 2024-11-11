import {
    PUBSUB_CONTROL_CALL_ARGS,
    PUBSUB_CONTROL_CALL_METHOD
} from "../control.mjs";
import {getLogger} from "velor-services/injection/services.mjs";
import {replyToRequest} from "../replyToRequest.mjs";


export async function handleControlRpc(services, subscriber, control) {
    const content = control.getData();
    let method = content[PUBSUB_CONTROL_CALL_METHOD];
    let args = content[PUBSUB_CONTROL_CALL_ARGS];

    try {
        let result = await subscriber[method](...args);
        await replyToRequest(services, control, result);
    } catch (e) {
        getLogger(services).debug("Control method call failed", method, args, e);
    }
}

