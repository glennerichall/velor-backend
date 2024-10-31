import {LocalPubSub} from "../../distribution/impl/LocalPubSub.mjs";
import {PubSubMixin} from "../../distribution/impl/PubSubMixin.mjs";

export function createLocalPubSubInstance(services) {
    return new (PubSubMixin(LocalPubSub))();
}