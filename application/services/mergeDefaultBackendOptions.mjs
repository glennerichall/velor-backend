import {backendFactories} from "./backendFactories.mjs";

export function mergeDefaultBackendOptions(options) {
    let {
        factories = {},
    } = options;

    return {
        ...options,

        factories: {
            ...backendFactories,
            ...factories
        }
    };
}