export class PushBuffer {
    constructor(buffer, defaultFillSize = 1) {
        this._buffer = buffer;
        this._offset = 0;
        this._defaultFillSize = defaultFillSize;
    }

    push(values) {
        this._buffer.set(values, this._offset);
        this._offset += values.length;
    }

    fill(value, n = this._defaultFillSize) {
        if (n === undefined) n = this._defaultFillSize;

        if (Array.isArray(value)) {
            let m = Math.floor(n / value.length);
            for (let i = 0; i < m; i++) {
                this.push(value);
            }
            // add remaining missing values
            const r = n - m * value.length;
            if (r > 0) {
                this.push(value.slice(0, r));
            }
        } else {
            this.push(new Array(n).fill(value));

            // buffer.fill is slow
            //     this._buffer.fill(value, this._offset,
            //         (this._offset + 1) * n);
            //     this._offset += n;
        }
    }
}