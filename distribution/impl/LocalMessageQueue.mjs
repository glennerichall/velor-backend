import {Emitter} from "velor-utils/utils/Emitter.mjs";
import {getLogger} from "velor-services/injection/services.mjs";

export class LocalMessageQueue {
    #ready;
    #jobsIndex;
    #pause;
    #resume;
    #processing = false;
    #emitter;
    #active = 0;

    constructor() {
        this.#ready = true;
        // The keys() method of Map instances returns a new map iterator
        // object that contains the keys for each element in this map in insertion order.
        // So we can mimic a FIFO.
        this.#jobsIndex = new Map();
        this.timeout = 100;
        this.#pause = null;
        this.#resume = null;
        this.#emitter = new Emitter();
    }

    pause() {
        getLogger(this).debug("Paused message queue");
        this.#pause = new Promise(resolve => this.#resume = resolve);
    }

    resume() {
        getLogger(this).debug("Resumed message queue");
        if (this.#resume) {
            this.#resume();
            this.#pause = null;
            this.#resume = null;
        }
    }

    async open() {
        this.#ready = true;
    }

    async waitReady() {
        return this.#ready;
    }

    async close() {
        this.#ready = false;
    }

    getJobCount() {
        return new Promise(resolve => resolve({
            active: this.#active,
            waiting: this.#jobsIndex.size
        }));
    }

    obliterate() {
        this.#jobsIndex.clear();
    }

    onJobFinished(type, listener) {
        if (!this.#ready) {
            throw new Error('Job queue not opened');
        }
        return this.#emitter.on('finished:' + type, (result, job) => {
            listener(result, job);
        })
    }

    waitJob() {
        throw new Error('Not implemented');
    }

    abort(jobId) {
        if (this.#jobsIndex.has(jobId)) {
            this.#jobsIndex.get(jobId).aborted = true;
        } else {
            throw new Error(`No job with id ${jobId}`);
        }
    }

    async submit(name, data, options) {
        if (!this.#ready) {
            throw new Error('Job queue not opened');
        }
        const job = {
            name,
            data,
            aborted: false,
            ...options
        };

        // keep a job queue, it may be removed by calling obliterate() or abort()
        this.#jobsIndex.set(name, job);

        if (this.#processing) return;
        this.#processing = true;

        const consume = async () => {
            if (this.#pause) {
                getLogger(this).debug('Waiting queue to resume');
                await this.#pause;
                getLogger(this).debug(`Queue resumed`);
            }

            while (this.#jobsIndex.size > 0) {
                let [jobId, job] = this.#jobsIndex.entries().next().value;
                this.#jobsIndex.delete(jobId);
                let name = job.name;
                let aborted = job.aborted;
                if (!aborted) {
                    // using an emitter since bull only permits one processor per process per queue.
                    // and as this is a local queue, it may have only one listener.
                    getLogger(this).debug(`Processing job ${name}`);
                    this.#active++;
                    this.#emitter.emit(name, job);
                } else {
                    getLogger(this).debug(`Ignoring job ${name} as it is aborted`);
                }
            }

            this.#processing = false;
        }

        setTimeout(consume, this.timeout);
    }

    clearProcess() {
        this.#emitter.clear();
    }

    async process(name, worker) {
        if (!this.#ready) {
            throw new Error('Job queue not opened');
        }
        if (this.#emitter.hasListener(name)) {
            throw new Error('Only one worker for type ' + name + ' is allowed');
        }
        this.#emitter.on(name, async job => {
            let result = await worker(job);
            this.#active--;
            this.#emitter.emit('finished:' + name, result, job);
        })
    }
}