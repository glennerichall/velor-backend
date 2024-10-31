
import {getEnv} from "velor/utils/injection/baseServices.mjs";
import {createDatabaseManager} from "../../database/databaseInstance.mjs";

export function createDatabaseManagerInstance(services) {
    const env = getEnv(services);
    return createDatabaseManager(env);
}