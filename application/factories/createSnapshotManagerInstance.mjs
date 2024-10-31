import {SnapshotManager} from "../../file/SnapshotManager.mjs";
import {composeAutoSendMessageFactoryProviderForUserId} from "../composers/composeAutoSendMessageFactoryProviderForUserId.mjs";
import {bindClientEventsOnFileManager} from "../composers/bindClientEventsOnFileManager.mjs";
import {
    getDatabase,
    getSnapshotFileStore
} from "../services/backendServices.mjs";

export function createSnapshotManagerInstance(services) {
    const database = getDatabase(services);
    const snapshotFS = getSnapshotFileStore(services);
    const snapshotManager = new SnapshotManager(database, snapshotFS);

    const getEmitter = composeAutoSendMessageFactoryProviderForUserId(services);

    return bindClientEventsOnFileManager(snapshotManager, getEmitter);
}