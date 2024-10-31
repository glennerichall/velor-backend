import Queue from "bull";
import {getRedisConnectionsManager} from "./getRedisConnectionsManager.mjs";


export class BullRedis {
    constructor(connectionString, queueName) {
        this._connectionString = connectionString;
        this._queueName = queueName;
        this._queue = null;
        this._connections = null;
    }

    get isOpened() {
        return !!this._queue;
    }

    async open() {
        if (!this._queue) {
            this._connections = getRedisConnectionsManager(this._connectionString);
            // this._queue = new Queue(this._queueName, this._connections.getBullOptions());
            this._queue = new Queue(this._queueName, this._connectionString);
            this._queue.on('failed', (job, err) => {
                console.error('RedisBull', job, err.message);
            })
            this._queue.on('error', function (err) {
                console.error('RedisBull', err.message);
            })
        }
        return this._queue?.isReady();
    }

    async waitReady() {
        return this._queue?.isReady();
    }

    async close() {
        if (this._queue) {
            await this._queue?.close();
            await this._connections.release();
        }
        this._queue = null;
    }


}