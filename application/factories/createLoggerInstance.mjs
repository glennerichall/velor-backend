import winston from "winston";

import {getEnvValue, isProduction} from "velor-services/injection/baseServices.mjs";

import {LOG_LEVEL} from "../services/backendEnvKeys.mjs";

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