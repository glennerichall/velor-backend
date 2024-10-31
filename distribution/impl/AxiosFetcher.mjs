import axios from "axios";
import {AxiosHeaders} from "./AxiosHeaders.mjs";

export class AxiosFetcher {
    #client;

    constructor() {
        this.#client = axios.create();
    }

    get client() {
        return this.#client;
    }

    async send(url, args = {}) {
        let {headers} = args;

        if (headers && headers instanceof AxiosHeaders) {
            headers = headers.toObj();
        }

        if (args.body) {
            args.data = args.body;
            delete args.body;
        }

        let response;
        try {
            response = await this.client({
                url,
                ...args,
                headers,
                maxRedirects: 0,
                validateStatus: status => true, // never throw like window.fetch
            });
        } catch (e) {
            if (e.name === "AggregateError") {
                throw e.errors[e.errors.length - 1];
            }
            throw e;
        }

        // mimic browser's fetch
        response.ok = response.status >= 200 && response.status < 400;
        response.json = () => response.data;
        response.text = () => response.data;
        response.isHTTPResponse = true;

        return response;
    }

    request(...args) {
        return this.send(...args);
    }

    createHeaders() {
        return new AxiosHeaders();
    }

}