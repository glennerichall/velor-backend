import {subscribe} from "../actions/subscribe.mjs";

export async function handleControlSubscribe(services, wsClient, control) {
    const content = control.getData();

    const {
        channels,
    } = content;

    return subscribe(services, wsClient, ...channels);
}