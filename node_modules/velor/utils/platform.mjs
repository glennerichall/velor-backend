const isBrowser =
    typeof window !== "undefined" && typeof window.document !== "undefined";

const isNode =
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null;

const isWebWorker =
    typeof self === "object" &&
    self.constructor &&
    self.constructor.name === "DedicatedWorkerGlobalScope";

/**
 * @see https://github.com/jsdom/jsdom/releases/tag/12.0.0
 * @see https://github.com/jsdom/jsdom/issues/1537
 */
const isJsDom =
    (typeof window !== "undefined" && window.name === "nodejs") ||
    (typeof navigator !== "undefined" &&
        (navigator.userAgent.includes("Node.js") ||
            navigator.userAgent.includes("jsdom")));

const isDeno =
    typeof Deno !== "undefined" &&
    typeof Deno.version !== "undefined" &&
    typeof Deno.version.deno !== "undefined";

let cryptoLib;

export async function getCrypto() {
    if (!cryptoLib) {
        if (isBrowser) {
            // The maximum is exclusive and the minimum is inclusive
            const maxBytes = 6;
            const maxDec = 281474976710656; // 2 ** 48

            function randomInt(max = maxDec, min = 0) {
                const range = max - min;
                if (range <= 0) {
                    throw new Error('The maximum value must be higher than the minimum value.');
                }
                const getRandomInt = () =>
                    window.crypto.getRandomValues(new BigUint64Array(1))[0];

                return Math.floor(Number(getRandomInt()) / MAX_RANDOM_INT * (range + 1)) + min;
            }

            // Browser environment
            const MD5 = await import('crypto-js/md5');
            const hex = await import('crypto-js/enc-hex');
            const hmac = await import('crypto-js/hmac');
            const sha256 = await import('crypto-js/sha256');
            cryptoLib = {
                randomUUID: () => window.crypto.randomUUID(),
                randomInt: (...args) => randomInt(...args),
                md5: content => MD5(content).toString(hex),
                createHmac: hmacKey => hmac(sha256, hmacKey)
            };
        } else if (isNode) {
            const crypto = await import('crypto');
            cryptoLib = {
                randomUUID: () => crypto.randomUUID(),
                randomInt: (...args) => crypto.randomInt(...args),
                md5: content => crypto.createHash('md5').update(content).digest('hex'),
                createHmac: hmacKey => crypto.createHmac('sha256', hmacKey)
            };
        }
    }

    return cryptoLib;
}

function randomUUID() {
    return cryptoLib.randomUUID();
}

function randomInt(...args) {
    return cryptoLib.randomInt(...args);
}

function hashContent(content) {
    return cryptoLib.md5(content)
}

getCrypto();

export const MAX_RANDOM_INT = 281474976710655;

export {
    isBrowser,
    isWebWorker,
    isNode,
    isJsDom,
    isDeno,
    randomUUID,
    randomInt,
    cryptoLib,
    hashContent,
};