import {NotImplementedError} from "velor-utils/utils/errors/NotImplementedError.mjs";

export class RedisKeyStore {
    constructor(redis) {
        this._redis = redis;
    }

    async get(key) {
        return this._redis.get(key);
    }

    async set(key, value) {
        return this._redis.set(key, value);
    }

    async hset(mapName, key, value) {
        return this._redis.hset(mapName, key, value);
    }

    async hget(mapName, key) {
        return key ?
            this._redis.hget(mapName, key) :
            this._redis.hGetAll(mapName);
    }

    async hdel(mapName, ...keys) {
        return this._redis.hdel(mapName, ...keys);
    }

    async incr(key) {
        return this._redis.incr(key);
    }

    async push(key, ...values) {
        return this._redis.lpush(key, ...values);
    }

    async pop(key) {
        return this._redis.rpop(key);
    }

    async add(key, ...values) {
        return this._redis.sadd(key, ...values);
    }

    async isMember(key, value) {
        return this._redis.sismember(key, value);
    }

    async remove(key) {
        throw new NotImplementedError();
    }

    async update(key, callback) {
        throw new NotImplementedError();
    }
}