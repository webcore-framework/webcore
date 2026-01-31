import Application from "../Application/Application.js";

export default class CryptoRSA {
    constructor(){
        Object.freezeProp(this, "name", "RSA-OAEP");
        Object.freezeProp(this, "hash", "SHA-256");
        Object.freezeProp(this, "length", 2048);

        Object.freezeProp(CryptoRSA, "encoder", new TextEncoder("utf-8"));
        Object.freezeProp(CryptoRSA, "decoder", new TextDecoder("utf-8"));
    }

    // 创建密钥
    async generateKey(){
        try {
            const keys = Object.pure({name: "RSA-OAEP"});
            const keygen = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                    hash: "SHA-256"
                },
                true,
                ["encrypt", "decrypt"]
            );
            keys.keygen = Object.pure(keygen);
            const publicKey = await window.crypto.subtle.exportKey("spki", keygen.publicKey);
            const privateKey = await window.crypto.subtle.exportKey("pkcs8", keygen.privateKey);
            keys.publicKeyBase64 = Application.instance.text.encoding.arrayBufferToBase64(publicKey);
            keys.privateKeyBase64 = Application.instance.text.encoding.arrayBufferToBase64(privateKey);
            return keys;
        } catch {
            throw new Error("Failed to generate key.");
        }
    }

    // 解析公钥
    async importPublicKey(publicKey) {
        try {
            if (publicKey == undefined || publicKey == null) {
                throw new TypeError("The public key cannot be empty.");
            }
            if (typeof publicKey !== "string") {
                throw new TypeError("The public key must be of string type.");
            }
            const binary = Application.instance.text.encoding.base64ToArrayBuffer(publicKey);

            return await window.crypto.subtle.importKey(
                "spki",
                binary,
                {name: "RSA-OAEP", hash: {name: "SHA-256"}},
                true,
                ["encrypt"]
            );
        } catch {
            throw new Error("Import failed.");
        }
    }

    // 解析私钥
    async importPrivateKey(privateKey) {
        try {
            if (privateKey == undefined || privateKey == null) {
                throw new TypeError("The private key cannot be empty.");
            }
            if (typeof privateKey !== "string") {
                throw new TypeError("The private key must be of string type.");
            }
            const binary = Application.instance.text.encoding.base64ToArrayBuffer(privateKey);
            return await window.crypto.subtle.importKey(
                "pkcs8",
                binary,
                {name: "RSA-OAEP", hash: {name: "SHA-256"}},
                true,
                ["decrypt"]
            );
        } catch {
            throw new Error("Import failed.");
        }
    }

    // 加密
    async encrypt(plaintext, publicKey) {
        if (publicKey == undefined || publicKey == null) {
            throw new TypeError("The public key cannot be empty.");
        }
        if (Object.prototype.toString.call(publicKey) !== "[object CryptoKey]") {
            throw new TypeError("Invalid public key.");
        }
        if (plaintext == undefined || plaintext == null) {
            throw new TypeError("The plaintext cannot be empty.");
        }
        if (typeof plaintext !== "string") {
            throw new TypeError("The plaintext must be of string type.");
        }

        try {
            //
            const bytes = CryptoRSA.encoder.encode(plaintext);
            const plaintextLength = bytes.length;

            if (plaintextLength > 141) {
                const encryptChunks = [];
                for (let i = 0;i < plaintextLength;i += 141){
                    const encrypted = await window.crypto.subtle.encrypt(
                        {name: "RSA-OAEP"},
                        publicKey,
                        bytes.slice(i, Math.min(i + 141, plaintextLength))
                    );
                    encryptChunks.push(Application.instance.text.encoding.arrayBufferToBase64(encrypted));
                }
                return encryptChunks.join("|");
            } else {
                const encrypted = await window.crypto.subtle.encrypt(
                    {name: "RSA-OAEP"}, publicKey, bytes
                );
                return Application.instance.text.encoding.arrayBufferToBase64(encrypted);
            }
        } catch {
            throw new Error("Failed to encrypt.");
        }
    }

    // 解密
    async decrypt(ciphertext, privateKey) {
        if (privateKey == undefined || privateKey == null) {
            throw new TypeError("The private key cannot be empty.");
        }
        if (Object.prototype.toString.call(privateKey) !== "[object CryptoKey]") {
            throw new TypeError("Invalid private key.");
        }
        if (ciphertext == undefined || ciphertext == null) {
            throw new TypeError("The ciphertext cannot be empty.");
        }
        if (typeof ciphertext !== "string") {
            throw new TypeError("The ciphertext must be of string type.");
        }

        const ciphertextLength = ciphertext.length;

        try {
            if (ciphertext.includes("|")) {
                const chunks = ciphertext.split("|");
                const decryptChunks = [];
                for (const chunk of chunks){
                    const decrypted = await window.crypto.subtle.decrypt(
                        {name: "RSA-OAEP"},
                        privateKey,
                        Application.instance.text.encoding.base64ToArrayBuffer(chunk)
                    );
                    decryptChunks.push(CryptoRSA.decoder.decode(decrypted));
                }
                return decryptChunks.join("");
            } else if (ciphertext.length > 344) {
                const decryptChunks = [];
                for (let i = 0; i < ciphertext.length; i += 344) {
                    const decrypted = await window.crypto.subtle.decrypt(
                        {name: "RSA-OAEP"},
                        privateKey,
                        Application.instance.text.encoding.base64ToArrayBuffer(
                            ciphertext.substring(i, Math.min(i+344, ciphertext.length))
                        )
                    );
                    decryptChunks.push(CryptoRSA.decoder.decode(decrypted));
                }
                return decryptChunks.join("");
            } else {
                const decrypted = await window.crypto.subtle.decrypt(
                    {name: "RSA-OAEP"},
                    privateKey,
                    Application.instance.text.encoding.base64ToArrayBuffer(ciphertext)
                );
                return CryptoRSA.decoder.decode(decrypted);
            }
        } catch {
            throw new Error("Failed to decrypt.");
        }
    }
}
