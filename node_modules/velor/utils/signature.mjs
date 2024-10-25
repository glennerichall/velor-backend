import {cryptoLib} from "./platform.mjs";

let hmacKey;

export function initializeHmacSigning(key) {
    hmacKey = Buffer.from(key, 'hex');
}

export function signData(data) {
    const hmac = cryptoLib.createHmac(hmacKey);
    hmac.update(data);
    return hmac.digest();
}

export function verifySignature(data, signature) {
    let expected = signData(data);
    return expected === signature;
}