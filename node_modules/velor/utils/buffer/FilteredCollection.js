import {createIndex} from "./filters.js";

export class FilteredCollection {
    constructor(collection) {
        this._collection = collection;
        this._index = null;
        this._useFilter = false;
        this._length = -1;
    }

    set useFilter(v) {
        this._useFilter = v;
    }

    get useFilter() {
        return this._useFilter;
    }

    get length() {
        return this._useFilter ?
            this._length : this._collection.length;
    }

    mappedIndex(i) {
        if (this._useFilter) {
            i = this._index[i];
        }
        return i;
    }

    map(callback) {
        const res = new Array(this.length);
        for (let i = 0; i < res.length; i++) {
            res[i] = callback(this.get(i));
        }
        return res;
    }

    _get(i) {
        i = this.mappedIndex(i);
        return this._collection.get(i);
    }

    get(i) {
        return this._get(i);
    }

    findIndex(predicate) {
        const n = this.length;
        for (let i = 0; i < n; i++) {
            const elem = this.get(i);
            if (predicate(elem)) {
                return i;
            }
        }
        return -1;
    }

    find(predicate) {
        const index = this.findIndex(predicate);
        if (index >= 0) {
            return this.get(index);
        }
        return null;
    }

    filter(predicate) {
        const result = [];
        for (let elem of this) {
            if (predicate(elem)) {
                result.push(elem);
            }
        }
        return result;
    }

    setFilter(filter) {
        if (filter === null) {
            this._useFilter = false;
            return;
        }
        this._index = filter;
        this._length = filter.length;
        this._useFilter = true;
    }

    * [Symbol.iterator]() {
        for (let i = 0; i < this.length; i++) {
            yield this.get(i);
        }
    }

    createIndex(predicate, collection) {
        if (this._collection instanceof FilteredCollection && this._collection.useFilter) {
            collection = new FilteredCollection(collection);
            collection.setFilter(this._collection._index);
        }
        return createIndex(predicate, collection);
    }
}