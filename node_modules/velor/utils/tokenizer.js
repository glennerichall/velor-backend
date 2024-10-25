export function* tokenize(text) {
    let i = 0;
    let n = text.length;
    let j = 0;
    while (i < n) {
        j = text.indexOf('\n', i + 1);
        if (j < 0) j = text.length;
        let txt = text.slice(i, j);
        yield txt;
        i = j + 1;
    }
}