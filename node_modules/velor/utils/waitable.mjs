import {waitOnAsync} from "../../tests/helpers/utils/waitOnAsync.mjs";

export function waitable(obj) {
    return new Proxy({}, {
        get(target, prop) {
            let value = obj[prop];
            if (typeof value === 'function') {
                return (...args) => waitOnAsync(() => value(...args));
            } else {
                return value;
            }
        }
    });
}