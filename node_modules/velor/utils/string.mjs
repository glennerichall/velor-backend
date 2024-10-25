function stringifyWithCircularReferences(obj) {
    const seen = new WeakSet(); // Use a WeakSet to keep track of seen objects

    return JSON.stringify(obj, (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                // Circular reference detected
                return "[Circular]"; // Placeholder for circular references
            }
            seen.add(value);
        }
        return value; // Return value if not a circular reference
    }, 2); // Indent with 2 spaces for prettification
}

export function convertToString(value, lvl = 0) {
    if (value === undefined) {
        return '-';
    } else if (value === null) {
        return 'null';
    } else if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    } else if (Array.isArray(value)) {
        let suffix = '';
        if (value.length > 5) {
            let length = value.length;
            let [a, b, c, d, e] = value;
            value = [a, b, c, d, e];
            suffix = `, ... + ${length - 5} more items`;
        }
        return '[' + value.map((x) => convertToString(x)).join(',') + suffix + ']';
    } else if (typeof value === 'object') {
        // const str = Object.keys(value).map(x => {
        //     let subvalue;
        //     if (lvl <= 1) { // avoid circular references
        //         subvalue = convertToString(value[x], lvl + 1);
        //     }
        //     return `${x}:${subvalue}`;
        // }).join(', ');
        // return `{ ${str} }`;

        return "[Object]";
    } else if (typeof value === 'string') {
        if (value.length > 40) {
            value = value.substring(1, 37) + "...";
        }
        value = `"${value}"`;
    }
    return value;
}


const hasSpace = /\s/;
const hasSeparator = /(_|-|\.|:)/;
const hasCamel = /([a-z][A-Z]|[A-Z][a-z])/;

export function toNoCase(string) {
    if (hasSpace.test(string)) return string.toLowerCase()
    if (hasSeparator.test(string)) return (unSeparate(string) || string).toLowerCase()
    if (hasCamel.test(string)) return unCamelize(string).toLowerCase()
    return string.toLowerCase()
}

const separatorSplitter = /[\W_]+(.|$)/g

export function unSeparate(string) {
    return string.replace(separatorSplitter, function (m, next) {
        return next ? ' ' + next : ''
    })
}

const camelSplitter = /(.)([A-Z]+)/g

export function unCamelize(string) {
    return string.replace(camelSplitter, function (m, previous, uppers) {
        return previous + ' ' + uppers.toLowerCase().split('').join(' ')
    })
}

export function capitalizeToNormalCase(string) {
    return toNoCase(string).split(' ')
        .map(x => x[0].toUpperCase() + x.slice(1).toLowerCase());
}

export const generateRandomString = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function globToRegExp(glob) {
    const escapedGlob = glob
        // Escape characters that have special meaning in regex
        .replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&")
        // Convert glob wildcards to regex
        .replace(/\*/g, '[^\\/]*')
        .replace(/\?/g, '.');

    // Create a RegExp object, starting with "^" to match the beginning of the string
    // and ending with "$" to match the end of the string.
    return new RegExp(`^${escapedGlob}$`);
}



export function replaceParams(url, params) {
    return Object.keys(params).reduce((prev, cur) => prev.replace(':' + cur, params[cur]), url);
}

export function atob(base64) {
    let buffer = Buffer.from(base64, 'base64');
    return buffer.buffer.slice(buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength);
}

export function btoa(buffer) {
    return Buffer.from(buffer).toString('base64')
}

export function removeAnsiColors(str) {
    return str.replace(/\x1B\[[0-9;]*[mK]/g, '');
}