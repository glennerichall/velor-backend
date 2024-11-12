import {subscribe} from "../../actions/subscribe.mjs";

export async function handleControlSubscribe(services, subscriber, control) {
    const content = control.getData();

    const {
        channels,
    } = content;

    await subscribe(services, subscriber, ...channels);
    return true;
}

