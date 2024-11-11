import {subscribe} from "../../actions/subscribe.mjs";

export async function handleControlSubscribe(services, subscriber, control) {
    const content = control.getData();

    const {
        channels,
    } = content;

    return subscribe(services, subscriber, ...channels);
}

