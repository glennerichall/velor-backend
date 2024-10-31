import winston from "winston";

import {getEnv} from "velor/utils/injection/baseServices.mjs";
import {
    ENV_PRODUCTION
} from "velor/env.mjs";

export function createLoggerInstance(services) {
    const env = getEnv(services);

    // if(env.NODE_ENV === ENV_DEVELOPMENT) {
    //     return console;
    // }

    return winston.createLogger({
        level: env.ZUPFE_LOG_LEVEL ?? (env.NODE_ENV === ENV_PRODUCTION ? 'info' : 'debug'),
        transports: [
            new winston.transports.Console(),
        ],
        format: winston.format.printf((info) => {
            return info.message;
        }),
        silent: env.SILENT
    });
}