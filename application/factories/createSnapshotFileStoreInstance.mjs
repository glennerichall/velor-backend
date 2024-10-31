import {FileStore} from "../../file/FileStore.mjs";

import {getEnv} from "velor/utils/injection/baseServices.mjs";

export function createSnapshotFileStoreInstance(services) {
    const env = getEnv(services);
    const {
        ZUPFE_AWS_SNAPSHOT_BUCKET
    } = env;

    return new FileStore(ZUPFE_AWS_SNAPSHOT_BUCKET, env);
}