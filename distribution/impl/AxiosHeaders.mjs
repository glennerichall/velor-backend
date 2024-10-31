export class AxiosHeaders {
    constructor() {
        this._headers = [];
        this._headersByName = {};
    }

    toObj() {
        let headers = {};
        for (let header of this._headers) {
            headers[header.name] = header.value;
        }
        return headers;
    }

    append(name, value) {
        const header = {
            name,
            value
        };
        this._headers.push(header);
        this._headersByName[name.toLowerCase()] = header;
    }

    get(name) {
        return this._headersByName[name.toLowerCase()]?.value;
    }

    [Symbol.iterator]() {
        return this._headers.values();
    }
}