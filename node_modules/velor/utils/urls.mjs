import {replaceParams} from "./string.mjs";
import queryStringBuilder from "query-string";

export function areUrlsOnSameSite(url1, url2) {
    try {
        const parsedUrl1 = new URL(url1);
        const parsedUrl2 = new URL(url2);

        return parsedUrl1.protocol === parsedUrl2.protocol &&
            parsedUrl1.hostname === parsedUrl2.hostname;
    } catch (e) {
        // If there's an error in parsing either URL, they can't be on the same site
        return false;
    }
}

export function getQueryStringAsObject(url) {
    try {
        const queryString = new URL(url).search;
        const params = new URLSearchParams(queryString);
        const result = {};

        for (const [key, value] of params) {
            result[key] = value;
        }

        return result;
    } catch (e) {
        return {};
    }
}

export function buildUrl(url, params = {}, query = {}) {
    // take an url in url index and replace all occurrences of :param in url
    // {bucketname: '1234', what: 'files'}
    // ex: https://localhost:3000/api/v1/:what/:bucketname
    //     https://localhost:3000/api/v1/files/1234

    url = replaceParams(url, params);

    let queryString = '';
    if (typeof query === 'string') {
        queryString = encodeURI(query);
    } else {
        for (let key in query) {
            if (typeof query[key] === 'object' && !Array.isArray(query[key])) {
                query[key] = btoa(JSON.stringify(query[key]));
            }
        }
        queryString = queryStringBuilder.stringify(query);
    }

    if (queryString.length > 0) {
        url = url + "?" + queryString;
    }

    return url;
}

export function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}