import {Timer} from "velor/utils/Timer.mjs";
import {timeoutAsync} from "velor/utils/sync.mjs";

export async function waitOnAsync(callback, timeout = 30000) {
    const timer = new Timer();
    let error;
    while (timer.elapsed() <= timeout) {
        try {
            let done = await callback(timer);
            if (done !== false) return;
        } catch (e) {
            error = e;
        }
        await timeoutAsync(100);
    }
    if (error) {
        throw error;
    } else {
        error = new Error(`Timeout: ${callback.toString()} `);
        throw error;
    }
}