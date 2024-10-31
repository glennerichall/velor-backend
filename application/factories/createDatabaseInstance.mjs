import {getProvider} from "velor/utils/injection/baseServices.mjs";

import {s_databaseManager} from "../services/backendServiceKeys.mjs";

export function createDatabaseInstance(services) {
    const provider = getProvider(services);
    return provider[s_databaseManager]().getDatabase();
}