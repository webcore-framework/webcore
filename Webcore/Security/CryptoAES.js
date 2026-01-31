import Application from "../Application/Application.js";

export default class CryptoAES {
    constructor(){
        Object.freezeProp(this, "name", "AES-GCM");
        Object.freezeProp(this, "length", 256);

        Object.freezeProp(CryptoAES, "encoder", new TextEncoder());
        Object.freezeProp(CryptoAES, "decoder", new TextDecoder());
    }

    async generateKey(){
        try {
            const key = Object.pure({name: "AES-GCM"});
            key.secretKey = await window.crypto.subtle.generateKey(
                {name: "AES-GCM",length: 256},
                true,
                ["encrypt", "decrypt"]
            );
            key.rawKey = await window.crypto.subtle.exportKey("raw", key.secretKey);
            key.jwkKey = await window.crypto.subtle.exportKey("jwk", key.secretKey);
            key.base64Key = Application.instance.text.encoding.arrayBufferToBase64(key.rawKey);
            return key;
        } catch {
            throw new Error("Failed to generate key.");
        }
    }

    async importKey(secretKey) {
        if (secretKey == undefined || secretKey == null) {
            throw new TypeError("The secret key cannot be empty.");
        }
        if (secretKey instanceof Uint8Array){
            return await window.crypto.subtle.importKey(
                "raw",
                secretKey.buffer,
                {name: "AES-GCM"},
                true, ["encrypt", "decrypt"]
            );
        } else if (secretKey instanceof ArrayBuffer){
            return await window.crypto.subtle.importKey(
                "raw",
                secretKey,
                {name: "AES-GCM"},
                true, ["encrypt", "decrypt"]
            );
        } else if (typeof secretKey === "string"){
            const buffer = Application.instance.text.encoding.base64ToArrayBuffer(secretKey)
            return await window.crypto.subtle.importKey(
                "raw",
                buffer,
                {name: "AES-GCM"},
                true, ["encrypt", "decrypt"]
            );
        } else {
            throw new TypeError("Invalid secret key.");
        }
    }

    async encrypt(plaintext, key) {
        if (key == undefined || key == null) {
            throw new TypeError("The secret key cannot be empty.");
        }
        if (Object.prototype.toString.call(key) !== "[object CryptoKey]") {
            throw new TypeError("Invalid secret key.");
        }
        if (plaintext == undefined || plaintext == null) {
            throw new TypeError("The plaintext cannot be empty.");
        }
        if (typeof plaintext !== "string") {
            throw new TypeError("The plaintext must be of string type.");
        }

        try {
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const ciphertext = await window.crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: iv.buffer,
                    tagLength: 128
                },
                key,
                CryptoAES.encoder.encode(plaintext)
            );
            const result = Object.pure({
                iv: Application.instance.text.encoding.arrayBufferToBase64(iv.buffer),
                data: Application.instance.text.encoding.arrayBufferToBase64(ciphertext),
                timestamp: Date.now(),
                algorithm: "AES-GCM-256"
            });
            return result;
        } catch (error) {
            throw new Error("Failed to encrypt.",error);
        }
    }

    async decrypt(ciphertext, key, iv){
        if (key == undefined || key == null) {
            throw new TypeError("The secret key cannot be empty.");
        }
        if (Object.prototype.toString.call(key) !== "[object CryptoKey]") {
            throw new TypeError("Invalid secret key.");
        }
        if (iv == undefined || iv == null) {
            throw new TypeError("The initialization vector (IV) cannot be empty.");
        }
        if (typeof iv !== "string") {
            throw new TypeError("The initialization vector (IV) must be of string type.");
        }
        if (ciphertext == undefined || ciphertext == null) {
            throw new TypeError("The ciphertext cannot be empty.");
        }
        if (typeof ciphertext !== "string") {
            throw new TypeError("The ciphertext must be of string type.");
        }

        try {
            const ivBuffer = Application.instance.text.encoding.base64ToArrayBuffer(iv)
            if (ivBuffer.byteLength !== 12) {throw new TypeError("Invalid IV length: expected 12 bytes.");}
            const ciphertextBuffer = Application.instance.text.encoding.base64ToArrayBuffer(ciphertext);
            if (ciphertextBuffer.byteLength < 16) {throw new TypeError("Ciphertext too short");}
            const decrypted = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: ivBuffer,
                    tagLength: 128
                },
                key,
                ciphertextBuffer
            );
            return CryptoAES.decoder.decode(decrypted);
        } catch {
            throw new Error("Failed to decrypt.");
        }
    }
}
