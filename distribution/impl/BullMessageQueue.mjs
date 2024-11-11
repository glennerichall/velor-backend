import {BullRedis} from "./BullRedis.mjs";
import {getLogger} from "velor-services/injection/services.mjs";

const KEEP_QUEUE_LENGTH = 10;

export class BullMessageQueue extends BullRedis {
    constructor(connectionString, queueName = process.env.NODE_ENV + ".jobs") {
        super(connectionString, queueName);
    }

    getJobCount() {
        return this._queue?.getJobCounts();
    }

    obliterate() {
        return this._queue?.obliterate({force: true});
    }

    onJobFinished(type, listener) {
        const cb = async (jobId, result) => {
            getLogger(this).debug(`Job ${jobId} completed`);
            try {
                result = JSON.parse(result);
                getLogger(this).debug(`Job ${jobId} completed`, result);
            } catch (e) {
                getLogger(this).warn(`Job ${jobId} failed parsing: ${e}`);
            }
            return listener(result);
        };
        this._queue?.on('global:completed', cb);
        return () => this._queue?.off(type, cb);
    }

    waitJob() {
        return this._queue?.getNextJob();
    }

    async abort(jobId) {
        const job = await this._queue?.getJob(jobId);
        if (job !== null) {
            try {
                await job.remove();
                getLogger(this).info(`${jobId} was aborted and removed from the queue`);
            } catch (e) {
                getLogger(this).error(e.message);
            }
        }
    }

    async submit(type, content, options) {
        return this._queue?.add(type, content, {
            ...options,
            removeOnComplete: KEEP_QUEUE_LENGTH,
            removeOnFail: KEEP_QUEUE_LENGTH
        });
    }

    process(type, listener, timeout = 60000) {
        return this._queue?.process(type, async job => {
            return new Promise(async (resolve, reject) => {
                let hasTimedOut = false;

                // if job not completed before timeout, job is considered stalled.
                const timeoutId = setTimeout(
                    () => {
                        hasTimedOut = true;
                        reject(new Error(`Job ${job.id} has stalled.`));
                    },
                    timeout);
                try {
                    let result = await listener(job);
                    if (!hasTimedOut) {
                        resolve(result);
                    }
                } finally {
                    clearTimeout(timeoutId);
                }
            });
        });
    }

    getQueue() {
        return this._queue;
    }
}