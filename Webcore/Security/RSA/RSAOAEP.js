import Application from "../../Application/Application.js";

export default class RSAOAEP {
    constructor(secureMode=true){
        Object.freezeProp(this, "secureMode", secureMode);

        Object.freezeProp(this, "name", "RSA-OAEP");
        Object.freezeProp(this, "hash", "SHA-256");
        Object.freezeProp(this, "length", 2048);

        Object.freezeProp(RSAOAEP, "encoder", new TextEncoder("utf-8"));
        Object.freezeProp(RSAOAEP, "decoder", new TextDecoder("utf-8"));

        if (secureMode){
            // 创建密钥
            Object.freezeProp(this, "generateKey", async function generateKey(){
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
            });

            // 解析公钥
            Object.freezeProp(this, "importPublicKey", async function importPublicKey(publicKey) {
                try {
                    Error.throwIfNotString(publicKey, "The public key");
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
            });

            // 解析私钥
            Object.freezeProp(this, "importPrivateKey", async function importPrivateKey(privateKey) {
                try {
                    Error.throwIfNotString(privateKey, "The private key");
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
            });

            // 加密
            Object.freezeProp(this, "encrypt", async function encrypt(plaintext, publicKey) {
                Error.throwIfNull(publicKey, "The public key");
                if (Object.prototype.toString.call(publicKey) !== "[object CryptoKey]") {
                    throw new TypeError("Invalid public key.");
                }
                Error.throwIfNotString(plaintext, "The plaintext");
                try {
                    const bytes = RSAOAEP.encoder.encode(plaintext);
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
            });

            // 解密
            Object.freezeProp(this, "decrypt", async function decrypt(ciphertext, privateKey) {
                Error.throwIfNull(privateKey, "The private key");
                if (Object.prototype.toString.call(privateKey) !== "[object CryptoKey]") {
                    throw new TypeError("Invalid private key.");
                }
                Error.throwIfNotString(ciphertext, "The ciphertext");
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
                            decryptChunks.push(RSAOAEP.decoder.decode(decrypted));
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
                            decryptChunks.push(RSAOAEP.decoder.decode(decrypted));
                        }
                        return decryptChunks.join("");
                    } else {
                        const decrypted = await window.crypto.subtle.decrypt(
                            {name: "RSA-OAEP"},
                            privateKey,
                            Application.instance.text.encoding.base64ToArrayBuffer(ciphertext)
                        );
                        return RSAOAEP.decoder.decode(decrypted);
                    }
                } catch {
                    throw new Error("Failed to decrypt.");
                }
            });
        }
    }
}
