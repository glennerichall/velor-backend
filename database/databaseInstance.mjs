import * as access from "../persistence/access.mjs";
import * as acl from "../persistence/acl.mjs";
import * as auths from "../persistence/auths.mjs";
import * as preferences from "../persistence/preferences.mjs";
import * as authTokens from "../persistence/authTokens.mjs";
import * as userAuths from "../persistence/user_auths.mjs";
import * as apiKeys from "../persistence/apiKeys.mjs";
import * as users from "../persistence/users.mjs";
import * as gcode from "../persistence/gcode.mjs";
import * as printers from "../persistence/printers.mjs";
import * as snapshot from "../persistence/snapshot.mjs";
import * as files from "../persistence/files.mjs";
import * as tokens from "../persistence/tokens.mjs";
import * as system from "../persistence/system.mjs";
import {DatabaseManager} from "velor/database/DatabaseManager.mjs";
import {ENV_TEST} from "velor/env.mjs";

export function getRawStatements() {
    return {
        access,
        acl,
        auths,
        apiKeys,
        preferences,
        authTokens,
        userAuths,
        users,
        files,
        snapshot,
        gcode,
        printers,
        tokens,
        system
    };
}


export function createDatabaseManager(env) {
    let {
        NODE_ENV,
        ZUPFE_DATABASE_SCHEMA,
        ZUPFE_DATABASE_URL_VAR,
        ZUPFE_DATABASE_CONNECTION_STRING = env[ZUPFE_DATABASE_URL_VAR],
    } = env;

    let schema = ZUPFE_DATABASE_SCHEMA;
    let connectionString = ZUPFE_DATABASE_CONNECTION_STRING;

    if (NODE_ENV === ENV_TEST) {
        connectionString += "?sslmode=disable";
    }

    let statements = getRawStatements();
    let manager = new DatabaseManager(schema, connectionString);
    return manager.bindStatements(statements);
}


