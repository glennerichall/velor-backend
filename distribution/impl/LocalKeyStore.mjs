import {
    MapArrayMixin,
    MapMapMixin,
    MapSetMixin
} from "velor-utils/utils/map.mjs";

export class LocalKeyStore extends MapArrayMixin(MapMapMixin(MapSetMixin(Map))) {

    get map() {
        return this;
    }

    remove(key) {
        return this.delete(key);
    }

    update(key, callback) {
        const value = this.get(key);
        return this.set(key, callback(value));
    }

    incr(key) {
        if (!this.has(key)) {
            this.set(key, -1);
        }
        let value = this.get(key);
        value++;
        this.set(key, value);
        return value;
    }
}

// the async methods are there to mimic Redis key store.
export class LocalAsyncKeyStore extends LocalKeyStore {

    async incr(...args) {
        return super.async(...args);
    }

    async update(...args) {
        return super.update(...args);
    }

    async remove(...args) {
        return super.remove(...args);
    }

    async push(...args) {
        return super.push(...args);
    }

    async pop(...args) {
        return super.pop(...args);
    }

    async findIndex(...args) {
        return super.findIndex(...args);
    }

    async find(...args) {
        return super.find(...args);
    }

    async hset(...args) {
        return super.hset(...args);
    }

    async hget(...args) {
        return super.hget(...args);
    }

    async hdel(...args) {
        return super.hdel(...args);
    }

    async add(...args) {
        return super.add(...args);
    }

    async isMember(...args) {
        return super.isMember(...args);
    }
}