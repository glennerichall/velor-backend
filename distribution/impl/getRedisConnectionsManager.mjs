import Redis from "ioredis";

const servers = {};


class RedisConnectionsManager {
    constructor(connectionString) {
        this._connectionString = connectionString;
        this._subscriber = null;
        this._client = null;
        this._refs = 0;
    }

    getBullOptions() {
        return {};
        this._refs++;
        return {
            // redisOpts here will contain at least a property of connectionName which will identify the queue based on
            // its name
            createClient: (type, redisOpts) => {
                delete redisOpts.enableReadyCheck;
                delete redisOpts.maxRetriesPerRequest;
                switch (type) {
                    case 'client':
                        if (!this._client) {
                            this._client = new Redis(this._connectionString, redisOpts);
                        }
                        return this._client;
                    case 'subscriber':
                        if (!this._subscriber) {
                            this._subscriber = new Redis(this._connectionString, redisOpts);
                        }
                        return this._subscriber;
                    case 'bclient':
                        return new Redis(this._connectionString, redisOpts);
                    default:
                        throw new Error('Unexpected connection type: ' + type);
                }
            }
        }
    }

    release() {
        this._refs--;

        if (this._refs === 0) {
            if (this._client) {
                this._client.disconnect();
            }

            if (this._subscriber) {
                this._subscriber.disconnect();
            }
        }
    }

}

// Reuse Redis connections:
// https://github.com/OptimalBits/bull/blob/develop/PATTERNS.md#reusing-redis-connections
export function getRedisConnectionsManager(connectionString) {

    let connectionManager = servers[connectionString];

    if (!connectionManager) {
        connectionManager = servers[connectionString] =
            new RedisConnectionsManager(connectionString);
    }

    return connectionManager;
}