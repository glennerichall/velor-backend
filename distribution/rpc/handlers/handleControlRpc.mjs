import {
    PUBSUB_CONTROL_CALL_ARGS,
    PUBSUB_CONTROL_CALL_METHOD
} from "../control.mjs";

export async function handleControlRpc(services, subscriber, control) {
    const content = control.getData();
    let method = content[PUBSUB_CONTROL_CALL_METHOD];
    let args = content[PUBSUB_CONTROL_CALL_ARGS];
    return subscriber[method](...args);
}

