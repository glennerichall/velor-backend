export class BoolArray {
    constructor(n) {
        this._length = n;
        this._buffer = new ArrayBuffer(Math.ceil(n / 8));
    }

    get(i) {
        const j = Math.floor(i / 8);
        const k = 1 << (i % 8);
        return !!(this._buffer[j] & k);
    }

    set(i, v) {
        const j = Math.floor(i / 8);
        const k = 1 << (i % 8);
        if (v) {
            this._buffer[j] |= k;
        } else {
            this._buffer[j] &= ~k;
        }
    }

    get length() {
        return this._length;
    }
}