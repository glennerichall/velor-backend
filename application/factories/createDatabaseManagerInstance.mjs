import {createDatabaseManager} from "../../database/databaseInstance.mjs";

export function createDatabaseManagerInstance(services) {
    return createDatabaseManager(services);
}