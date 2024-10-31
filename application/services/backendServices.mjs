import {
    getEnv,
    getProvider
} from "velor/utils/injection/baseServices.mjs";

import {
    s_clientProvider,
    s_database,
    s_gcodeFS,
    s_gcodeManager,
    s_keyStore,
    s_messageBuilder,
    s_messageFactory,
    s_messageQueue,
    s_pubSub,
    s_snapshotFS,
    s_snapshotManager
} from "./backendServiceKeys.mjs";

export function getDatabase(services) {
    return getProvider(services)[s_database]();
}

export function getMessageQueue(services) {
    return getProvider(services)[s_messageQueue]();
}

export function getKeyStore(services) {
    return getProvider(services)[s_keyStore]();
}

export function getGcodeFileStore(services) {
    return getProvider(services)[s_gcodeFS]();
}

export function getSnapshotFileStore(services) {
    return getProvider(services)[s_snapshotFS]();
} // please use readPrinterInstance middleware before
export function getMessageBuilder(services) {
    return getProvider(services)[s_messageBuilder]();
}

export function getGcodeManager(services) {
    return getProvider(services)[s_gcodeManager]();
}

export function getSnapshotManager(services) {
    return getProvider(services)[s_snapshotManager]();
}

export function getFileStores(services) {
    return {
        snapshot: getSnapshotFileStore(services),
        gcode: getGcodeFileStore(services)
    };
}

export function getFileManagers(services) {
    return {
        gcode: getGcodeManager(services),
        snapshot: getSnapshotManager(services)
    };
}

export function getMessageFactory(services) {
    return getProvider(services)[s_messageFactory]();
}

export function getClientProvider(services) {
    return getProvider(services)[s_clientProvider]();
}

export function getPubSub(services) {
    return getProvider(services)[s_pubSub]();
}