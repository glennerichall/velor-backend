import {BullMessageQueue} from "../../distribution/impl/BullMessageQueue.mjs";
import {getEnvValue} from "velor/utils/injection/baseServices.mjs";

export function createMessageQueueInstance(services) {

    const {
        NODE_ENV,
        ZUPFE_REDISCLOUD_URL_VAR,
    } = env;


    const redisQueueName = getEnvValue(REDIS_QUEUE_NAME)

    const {
        ZUPFE_REDIS_QUEUE_NAME = NODE_ENV + ".jobs",
        REDIS_CONNECTION_STRING = env[ZUPFE_REDISCLOUD_URL_VAR],
    } = env;

    return new BullMessageQueue(REDIS_CONNECTION_STRING, ZUPFE_REDIS_QUEUE_NAME);
}