import {getLogger} from "velor-services/injection/services.mjs";

export class ClientIndex {
    #key;
    #keyStore;

    constructor(key, keyStore) {
        this.#key = key;
        this.#keyStore = keyStore;
    }

    async add(client) {
        try {
            await this.#keyStore.hset(this.#key, client.id, JSON.stringify(client.getInfo()));
            return true;
        } catch (e) {
            getLogger(this).error(e);
            return false;
        }
    }

    async remove(...clients) {
        try {
            await this.#keyStore.hdel(this.#key, ...clients.map(client => client.id));
            return true;
        } catch (e) {
            getLogger(this).error(e);
            return false;
        }
    }

    async getAll() {
        try {
            const clients = await this.#keyStore.hget(this.#key);
            return clients.map(client => JSON.parse(client));
        } catch (e) {
            getLogger(this).error(e);
            return [];
        }
    }

}