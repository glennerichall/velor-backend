import {ENV_NAME_PREFIX} from "./ServicesContext.mjs";
import {getConstants} from "./baseServices.mjs";

export function createEnvNameResolver(services) {
    let constants = getConstants(services);
    return {
        resolve(name) {
            return constants[ENV_NAME_PREFIX] + "_" + name;
        }
    }
}