import * as acl from "../persistence/acl.mjs";
import * as apiKeys from "../persistence/apiKeys.mjs";
import * as files from "../persistence/files.mjs";
import * as tokens from "../persistence/tokens.mjs";
import * as system from "../persistence/system.mjs";
import {DatabaseManager} from "velor/database/DatabaseManager.mjs";
import {ENV_TEST} from "velor/env.mjs";
import {getEnvValue, getNodeEnv} from "velor/utils/injection/baseServices.mjs";
import {
    DATABASE_CONNECTION_STRING,
    DATABASE_SCHEMA,
    DATABASE_URL_VAR
} from "../application/services/backendEnvKeys.mjs";

export function getRawStatements() {
    return {
        acl,
        apiKeys,
        files,
        tokens,
        system
    };
}


export function createDatabaseManager(services) {
    let schema = getEnvValue(services, DATABASE_SCHEMA);
    let connectionString = getEnvValue(services, DATABASE_CONNECTION_STRING) ??
        getEnvValue(services, DATABASE_URL_VAR);

    if (getNodeEnv(services) === ENV_TEST) {
        connectionString += "?sslmode=disable";
    }

    let statements = getRawStatements();
    let manager = new DatabaseManager(schema, connectionString);
    return manager.bindStatements(statements);
}


