export class Token {
    constructor(name, options = {}) {
        const {
            ttl = 10 // 10 minutes
        } = options;
        this._ttl = ttl;
        this._expiration = new Date().getTime() + ttl * 60 * 1000;
        this._name = name;
    }

    get isExpired() {
        return new Date().getTime() >= this._expiration;
    }

    get name() {
        return this._name;
    }

    refresh() {
        let ttl = this._ttl;
        this._expiration = new Date().getTime() + ttl * 60 * 1000;
    }
}