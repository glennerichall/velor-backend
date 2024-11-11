import {
    PUBSUB_CONTROL_CALL,
    PUBSUB_CONTROL_CALL_ARGS,
    PUBSUB_CONTROL_CALL_METHOD,
    PUBSUB_CONTROL_SUBSCRIBE,
    PUBSUB_CONTROL_UNSUBSCRIBE
} from "../rpc/control.mjs";
import {PubSubMessageBuilder} from "./PubSubMessageBuilder.mjs";

export class PubSubMessageFactory {
    #builder;
    
    constructor(builder) {
        this.#builder = new PubSubMessageBuilder(builder);
    }

    callMethod(method, args) {
        return this.#builder.newControlRequest(PUBSUB_CONTROL_CALL, {
            [PUBSUB_CONTROL_CALL_METHOD]: method,
            [PUBSUB_CONTROL_CALL_ARGS]: args,
        });
    }

    subscribe(...channels) {
        return this.#builder.newControlRequest(PUBSUB_CONTROL_SUBSCRIBE, {
            channels
        });
    }

    unsubscribe(...channels) {
        return this.#builder.newControlRequest(PUBSUB_CONTROL_UNSUBSCRIBE, {
            channels
        });
    }
}