import {unsubscribe} from "../actions/unsubscribe.mjs";

export async function handleControlUnsubscribe(services, wsClient, control) {
    const content = control.getData();
    const {
        channels,
    } = content;
    return unsubscribe(services, wsClient, ...channels);
}