import {
    URL_SYSTEM_PUBLISH_PUBSUB,
} from "../../../shared/constants/urls.mjs";

import {ApiRequestBase} from "velor-api/api/ApiRequestBase.mjs";
import {btoa} from "velor-utils/utils/string.mjs";

export class PubSubApi extends ApiRequestBase {
    constructor(...args) {
        super(...args);
    }

    publish(message, ...channels) {
        return this.post(URL_SYSTEM_PUBLISH_PUBSUB)
            .send({
                message: btoa(message.buffer),
                channels
            });
    }
}