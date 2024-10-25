const X_MASK = 0x1;
const Y_MASK = 0x2;
const Z_MASK = 0x4;
const E_MASK = 0x8;

export class BoolBufferView {
    constructor(buffer, offset) {
        this._buffer = buffer;
        this.offset = offset;
    }

    get buffer() {
        return this._buffer;
    }

    get _uInt() {
        return this.buffer.getUint8(this.offset);
    }

    set _uInt(v) {
        this.buffer.setUint8(this.offset, v);
    }

    _setMask(v, mask) {
        if (v) {
            this._uInt |= mask;
        } else {
            this._uInt &= ~mask;
        }
    }

    _getMask(mask) {
        return !!(this._uInt & mask);
    }

    get x() {
        return this._getMask(X_MASK);
    }

    set x(v) {
        this._setMask(v, X_MASK);
    }

    get y() {
        return this._getMask(Y_MASK);
    }

    set y(v) {
        this._setMask(v, Y_MASK);
    }

    get z() {
        return this._getMask(Z_MASK);
    }

    set z(v) {
        this._setMask(v, Z_MASK);
    }
    
    get e() {
        return this._getMask(E_MASK);
    }

    set e(v) {
        this._setMask(v, E_MASK);
    }

    copy(buffer) {
        this.x = buffer.x;
        this.y = buffer.y;
        this.z = buffer.z;
        this.e = buffer.e;
    }
}
