let __instance__ = null;

export class Process {

    static getInstance() {
        if (__instance__ === null) {
            __instance__ = new Process();
        }
        return __instance__;
    }

    #on(sig, listener) {
        process.on(sig, listener);
        return () => process.off(sig, listener);
    }

    onTerm(listener) {
        return this.#on('SIGTERM', listener);
    }

    onInt(listener) {
        return this.#on('SIGINT', listener);
    }

    onUnhandledRejection(listener){
        return this.#on('unhandledRejection', listener);
    }

    exitNormally() {
        process.exit(0);
    }
}