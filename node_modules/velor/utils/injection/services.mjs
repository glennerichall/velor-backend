import {getProvider} from "./baseServices.mjs";
import {s_envNameResolver, s_logger} from "./serviceKeys.mjs";
import {isServiceAware} from "./ServicesContext.mjs";
import {noOp} from "../functional.mjs";
import winston from "winston";

export function getEnvNameResolver(serviceAware) {
    return getProvider(serviceAware)[s_envNameResolver]();
}

export function getLogger(servicesAware) {
    if (isServiceAware(servicesAware)) {
        return getProvider(servicesAware)[s_logger]();
    } else if (process.env.ZUPFE_LOG_LEVEL) {
        return winston.createLogger({
            level: process.env.ZUPFE_LOG_LEVEL,
            transports: [new winston.transports.Console()],
            format: winston.format.simple(),
        })
    } else {
        return {
            trace: noOp,
            silly: noOp,
            debug: noOp,
            warn: noOp,
            info: noOp,
            error: noOp,
            fatal: noOp,
            log: noOp,
        }
    }
}