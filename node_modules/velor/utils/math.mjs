export function nextPowerOf2(n) {
    const p2 = 1 << (31 - Math.clz32(n));
    if (p2 < n) return p2 << 1;
    return p2;
}

export function packInts(int1, int2, MAX_INT) {
    return (int1 * MAX_INT) + int2
}

export function unpackInts(packed, MAX_INT) {
    const int2 = packed % MAX_INT;
    const int1 = Math.floor(packed / MAX_INT);
    return {int1, int2};
}