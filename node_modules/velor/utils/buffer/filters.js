export function createIndex(predicate, collection) {
    const n = collection.length;
    const index = new Uint32Array(n);
    let count = 0;
    for (let i = 0; i < n; i++) {
        const elem = collection.get(i);
        if (predicate(elem)) {
            index[count] = i;
            count++;
        }
    }
    return new Uint32Array(index.buffer, 0, count);
}