import {createDatabaseManagerInstance} from "../factories/createDatabaseManagerInstance.mjs";
import {createDatabaseInstance} from "../factories/createDatabaseInstance.mjs";
import {createLocalPubSubInstance} from "../factories/createLocalPubSubInstance.mjs";
import {
    LocalAsyncKeyStore
} from "../../distribution/impl/LocalKeyStore.mjs";
import {createLoggerInstance} from "../factories/createLoggerInstance.mjs";
import {createMessageQueueInstance} from "../factories/createMessageQueueInstance.mjs";
import {createMessageCoderInstance} from "velor-api/api/factories/createMessageCoderInstance.mjs";
import {
    s_database,
    s_databaseManager,
    s_keyStore,
    s_logger,
    s_messageBuilder,
    s_messageQueue,
    s_pubSub, s_rpcSignaling, s_sync,
} from "./backendServiceKeys.mjs";
import {s_messageCoder} from "velor-api/api/services/apiServiceKeys.mjs";
import {createMessageBuilderInstance} from "velor-api/api/factories/createMessageBuilderInstance.mjs";
import {Synchronizer} from "velor-utils/utils/sync.mjs";
import {createRpcSignalingManager} from "../factories/createRpcSignalingManager.mjs";

export const backendFactories = {
    [s_pubSub]: createLocalPubSubInstance,
    [s_databaseManager]: createDatabaseManagerInstance,
    [s_database]: createDatabaseInstance,
    [s_keyStore]: LocalAsyncKeyStore,
    [s_logger]: createLoggerInstance,
    [s_messageQueue]: createMessageQueueInstance,
    [s_messageBuilder]: createMessageBuilderInstance,
    [s_messageCoder]: createMessageCoderInstance,
    [s_sync]: Synchronizer,
    [s_rpcSignaling]: createRpcSignalingManager,
};
