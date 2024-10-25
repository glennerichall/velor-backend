import {getServices} from "./ServicesContext.mjs";
import {getEnvNameResolver} from "./services.mjs";

export function getEnvName(serviceAware, name) {
    return getEnvNameResolver(serviceAware).resolve(name);
}

export function getClasses(serviceAware) {
    return getServices(serviceAware).classes;
}

export function getEnvValue(serviceAware, name) {
    let fullName = getEnvName(serviceAware, name);
    return getEnvironment(serviceAware)[fullName];
}

export function getEnvValues(serviceAware, ...names) {
    let resolver = getEnvNameResolver(serviceAware);
    const env = getEnvironment(serviceAware);
    return names.map(name => resolver.resolve(name))
        .map(fullName => env[fullName]);
}

export function getEnvironment(serviceAware) {
    return getServices(serviceAware).env;
}

export function getEnv(serviceAware) {
    return getEnvironment(serviceAware);
}

export function getConstants(serviceAware) {
    return getServices(serviceAware).constants;
}

export function getFactories(serviceAware) {
    let services = getServices(serviceAware);
    let factories = services.factories;
    return Object.keys(factories)
        .reduce((acc, key) => {
            acc[key] = (...args) => factories[key](services, ...args);
            return acc;
        }, {})
}

export function getProvider(serviceAware) {
    return getServices(serviceAware).provider;
}