import winston from "winston";

import {getEnvValue} from "velor/utils/injection/baseServices.mjs";

import {LOG_LEVEL} from "../services/backendEnvKeys.mjs";
import {isProduction} from "../services/backendServices.mjs";

export function createLoggerInstance(services) {
    const level = getEnvValue(services, LOG_LEVEL) ?? isProduction(services) ? 'info' : 'debug';

    return winston.createLogger({
        level,
        transports: [
            new winston.transports.Console(),
        ],
        format: winston.format.printf((info) => {
            return info.message;
        })
    });
}