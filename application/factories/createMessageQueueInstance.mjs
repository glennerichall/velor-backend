import {BullMessageQueue} from "../../distribution/impl/BullMessageQueue.mjs";
import {getEnvValue, getEnvValueIndirect, getNodeEnv} from "velor/utils/injection/baseServices.mjs";
import {REDIS_CONNECTION_STRING, REDIS_QUEUE_NAME, REDISCLOUD_URL_VAR} from "../services/backendEnvKeys.mjs";

export function createMessageQueueInstance(services) {

    const nodeEnv = getNodeEnv(services);
    const redisQueueName = getEnvValue(services, REDIS_QUEUE_NAME) ?? nodeEnv + ".jobs";
    const connectionString = getEnvValue(REDIS_CONNECTION_STRING) ??
        getEnvValueIndirect(services, REDISCLOUD_URL_VAR);

    return new BullMessageQueue(connectionString, redisQueueName);
}