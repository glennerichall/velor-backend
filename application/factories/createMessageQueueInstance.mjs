import {BullMessageQueue} from "../../distribution/impl/BullMessageQueue.mjs";

export function createMessageQueueInstance(options) {
    let {
        env,
    } = options;

    const {
        NODE_ENV,
        ZUPFE_REDISCLOUD_URL_VAR,
    } = env;

    const {
        ZUPFE_REDIS_QUEUE_NAME = NODE_ENV + ".jobs",
        REDIS_CONNECTION_STRING = env[ZUPFE_REDISCLOUD_URL_VAR],
    } = env;

    return new BullMessageQueue(REDIS_CONNECTION_STRING, ZUPFE_REDIS_QUEUE_NAME);
}