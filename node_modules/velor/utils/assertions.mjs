import {
    ENV_DEVELOPMENT,
    ENV_TEST
} from "../env.mjs";

export function assert(cond, message) {
    if (process.env.NODE_END === ENV_DEVELOPMENT ||
        process.env.NODE_ENV === ENV_TEST) {
        if (!cond) throw new Error(message);
    }
}