import crypto from "crypto";

let session_enc_key;
let session_enc_iv;

export function initializeEncryptionCipher(key, iv) {
    session_enc_key = Buffer.from(key, 'hex');
    session_enc_iv = Buffer.from(iv, 'hex');
}

//Encrypting text
export function encryptText(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', session_enc_key, session_enc_iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

export function encryptObject(obj) {
    return encryptText(JSON.stringify(obj));
}

export function decryptObject(obj) {
    return JSON.parse(decryptText(obj));
}

// Decrypting text
export function decryptText(text) {
    try {
        let encryptedText = Buffer.from(text, 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', session_enc_key, session_enc_iv)
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        return null;
    }
}