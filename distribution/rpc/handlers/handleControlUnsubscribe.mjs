import {unsubscribe} from "../../actions/unsubscribe.mjs";

export async function handleControlUnsubscribe(services, wsClient, control) {
    const content = control.getData();
    const {
        channels,
    } = content;
    await unsubscribe(services, wsClient, ...channels);
    return true;
}

