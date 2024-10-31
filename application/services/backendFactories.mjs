import {createDatabaseManagerInstance} from "../factories/createDatabaseManagerInstance.mjs";
import {createDatabaseInstance} from "../factories/createDatabaseInstance.mjs";
import {createLocalPubSubInstance} from "../factories/createLocalPubSubInstance.mjs";
import {
    LocalAsyncKeyStore
} from "../../distribution/impl/LocalKeyStore.mjs";
import {createLoggerInstance} from "../factories/createLoggerInstance.mjs";
import {createMessageQueueInstance} from "../factories/createMessageQueueInstance.mjs";
import {createGcodeFileStoreInstance} from "../factories/createGcodeFileStoreInstance.mjs";
import {createSnapshotFileStoreInstance} from "../factories/createSnapshotFileStoreInstance.mjs";
import {createMessageCoderInstance} from "../../../api/factories/createMessageCoderInstance.mjs";
import {createGcodeManagerInstance} from "../factories/createGcodeManagerInstance.mjs";
import {createSnapshotManagerInstance} from "../factories/createSnapshotManagerInstance.mjs";
import {createMessageFactoryInstance} from "../factories/createMessageFactoryInstance.mjs";
import {
    s_database,
    s_databaseManager,
    s_gcodeFS,
    s_gcodeManager,
    s_keyStore,
    s_logger,
    s_messageBuilder,
    s_messageFactory,
    s_messageQueue,
    s_pubSub,
    s_snapshotFS,
    s_snapshotManager
} from "./backendServiceKeys.mjs";
import {s_messageCoder} from "../../../api/services/apiServiceKeys.mjs";
import {createMessageBuilderInstance} from "../../../api/factories/createMessageBuilderInstance.mjs";

export const backendFactories = {
    [s_pubSub]: createLocalPubSubInstance,
    [s_databaseManager]: createDatabaseManagerInstance,
    [s_database]: createDatabaseInstance,
    [s_keyStore]: LocalAsyncKeyStore,
    [s_logger]: createLoggerInstance,
    [s_messageQueue]: createMessageQueueInstance,
    [s_gcodeFS]: createGcodeFileStoreInstance,
    [s_snapshotFS]: createSnapshotFileStoreInstance,
    [s_messageBuilder]: createMessageBuilderInstance,
    [s_messageCoder]: createMessageCoderInstance,
    [s_messageFactory]: createMessageFactoryInstance,
    [s_gcodeManager]: createGcodeManagerInstance,
    [s_snapshotManager]: createSnapshotManagerInstance,
};
