const Y_OFFSET = 1 * Float32Array.BYTES_PER_ELEMENT;
const Z_OFFSET = 2 * Float32Array.BYTES_PER_ELEMENT;
const E_OFFSET = 3 * Float32Array.BYTES_PER_ELEMENT;

export class FloatBufferView {
    constructor(buffer, offset) {
        this._buffer = buffer;
        this.offset = offset;
    }

    get buffer() {
        return this._buffer;
    }

    get x() {
        return this.buffer.getFloat32(this.offset);
    }

    set x(v) {
        this.buffer.setFloat32(this.offset, v);
    }

    get y() {
        return this.buffer.getFloat32(this.offset + Y_OFFSET);
    }

    set y(v) {
        this.buffer.setFloat32(this.offset + Y_OFFSET, v);
    }

    get z() {
        return this.buffer.getFloat32(this.offset + Z_OFFSET);
    }

    set z(v) {
        this.buffer.setFloat32(this.offset + Z_OFFSET, v);
    }

    get e() {
        return this.buffer.getFloat32(this.offset + E_OFFSET);
    }

    set e(v) {
        this.buffer.setFloat32(this.offset + E_OFFSET, v);
    }

    copy(buffer) {
        this.x = buffer.x;
        this.y = buffer.y;
        this.z = buffer.z;
        this.e = buffer.e;
    }
}
