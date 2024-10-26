import {isRouter} from "./isRouter.mjs";

export function tryCatchAsyncHandler(handler, name) {

    if (Array.isArray(handler)) {
        return handler.map(x => tryCatchAsyncHandler(x, name));
    } else if (isRouter(handler)) {
        handler.publicName = name;
        return handler;
    }

    const fun = async (...args) => {
        try {
            await handler(...args);
        } catch (e) {
            if (args.length >= 3) {
                let next = args[args.length - 1];
                next(e);
            }
        }
    }
    if (name) {
        fun.publicName = name;
    }
    fun.wrappedHandler = handler;
    return fun;
}