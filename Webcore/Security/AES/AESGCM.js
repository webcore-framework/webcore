import Application from "../../Application/Application.js";

export default class AESGCM {
    constructor(secureMode=true){
        Object.freezeProp(this, "secureMode", secureMode);
        Object.freezeProp(this, "name", "AES-GCM");
        Object.freezeProp(this, "length", 256);

        Object.freezeProp(AESGCM, "encoder", new TextEncoder());
        Object.freezeProp(AESGCM, "decoder", new TextDecoder());

        if (secureMode){

            // 创建密钥
            Object.freezeProp(this, "generateKey", async function generateKey(){
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
            });

            // 导入密钥
            Object.freezeProp(this, "importKey", async function importKey(secretKey){
                Error.throwIfNull(secretKey, "Secret key");
                if (secretKey instanceof Uint8Array){
                    return await window.crypto.subtle.importKey(
                        "spki",
                        secretKey.buffer,
                        {name: "AES-GCM"},
                        true, ["encrypt", "decrypt"]
                    );
                } else if (secretKey instanceof ArrayBuffer){
                    return await window.crypto.subtle.importKey(
                        "spki",
                        secretKey,
                        {name: "AES-GCM"},
                        true, ["encrypt", "decrypt"]
                    );
                } else if (typeof secretKey === "string"){
                    const buffer = Application.instance.text.encoding.base64ToArrayBuffer(secretKey)
                    return await window.crypto.subtle.importKey(
                        "spki",
                        buffer,
                        {name: "AES-GCM"},
                        true, ["encrypt", "decrypt"]
                    );
                } else {
                    throw new TypeError("Invalid secret key.");
                }
            });

            // 加密
            Object.freezeProp(this, "encrypt", async function encrypt(plaintext, key) {
                Error.throwIfNull(key, "Secret key");
                if (!(key instanceof CryptoKey)) {throw new TypeError("Invalid secret key.")}

                Error.throwIfNotString(plaintext, "Plaintext");
                // try {
                    const iv = window.crypto.getRandomValues(new Uint8Array(12));
                    const ciphertext = await window.crypto.subtle.encrypt(
                        {
                            name: "AES-GCM",
                            iv: iv.buffer,
                            tagLength: 128
                        },
                        key,
                        AESGCM.encoder.encode(plaintext)
                    );
                    return Object.pure({
                        iv: Application.instance.text.encoding.arrayBufferToBase64(iv.buffer),
                        data: Application.instance.text.encoding.arrayBufferToBase64(ciphertext),
                        timestamp: Date.now(),
                        algorithm: "AES-256-GCM"
                    });
                // } catch (error) {
                //     throw new Error("Failed to encrypt.",error);
                // }
            });

            // 解密
            Object.freezeProp(this, "decrypt", async function decrypt(ciphertext, key, iv){
                Error.throwIfNull(key, "Secret key");
                if (!(key instanceof CryptoKey)){throw new TypeError("Invalid secret key.")}

                Error.throwIfNotString(iv, "Initialization vector (IV)");
                Error.throwIfNotString(ciphertext, "Ciphertext");

                // try {
                    const ivBuffer = Application.instance.text.encoding.base64ToArrayBuffer(iv);
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
                    return AESGCM.decoder.decode(decrypted);
                // } catch {
                //     throw new Error("Failed to decrypt.");
                // }
            });

        } else {
            // http 协议下使用第三方加密库
            import("../lib/AESGCM.js").then(module=>{
                Object.freezeProp(AESGCM, "creator", module.default);

                // 创建密钥
                Object.freezeProp(this, "generateKey", async function generateKey(){
                    try {
                        const key = Object.pure({name: "AES-GCM"});
                        key.rawKey = crypto.getRandomValues(new Uint8Array(32));
                        key.base64Key = Application.instance.text.encoding.bytesToBase64(key.rawKey);
                        return key;
                    } catch {
                        throw new Error("Failed to generate key.");
                    }
                });

                // 导入密钥
                Object.freezeProp(this, "importKey", async function importKey(secretKey){
                    Error.throwIfNull(secretKey, "Secret key");
                    if (secretKey instanceof Uint8Array){
                        return secretKey
                    } else if (secretKey instanceof ArrayBuffer){
                        return new Uint8Array(secretKey)
                    } else if (typeof secretKey === "string"){
                        return Application.instance.text.encoding.base64ToBytes(secretKey)
                    } else {
                        throw new TypeError("Invalid secret key.");
                    }
                });

                // 加密
                Object.freezeProp(this, "encrypt", async function encrypt(plaintext, key){
                    if (typeof key === "string"){
                        key = Application.instance.text.encoding.base64ToBytes(key)
                    } else {
                        Error.throwIfNotBytes(key, "Secret Key")
                    }
                    Error.throwIfNotString(plaintext, "Plaintext");

                    const iv = window.crypto.getRandomValues(new Uint8Array(12));
                    const bytes = AESGCM.creator(key, iv).encrypt(AESGCM.encoder.encode(plaintext));
                    return Object.pure({
                        iv: Application.instance.text.encoding.bytesToBase64(iv),
                        data: Application.instance.text.encoding.bytesToBase64(bytes),
                        timestamp: Date.now(),
                        algorithm: "AES-256-GCM"
                    });
                });

                // 解密
                Object.freezeProp(this, "decrypt", async function decrypt(ciphertext, key, iv){
                    Error.throwIfNotString(ciphertext, "Ciphertext");

                    if (typeof key === "string"){
                        key = Application.instance.text.encoding.base64ToBytes(key)
                    } else {
                        Error.throwIfNotBytes(key, "Secret Key")
                    }

                    if (typeof iv === "string") {
                        iv = Application.instance.text.encoding.base64ToBytes(iv)
                        if (iv.byteLength !== 12) {throw new TypeError("Invalid IV length: expected 12 bytes.")}
                    } else {
                        Error.throwIfNotBytes(iv, "Initialization vector (IV)");
                    }

                    const bytes = AESGCM.creator(key, iv).decrypt(Application.instance.text.encoding.base64ToBytes(ciphertext));
                    return AESGCM.decoder.decode(bytes);
                });

            });
        }

    }
}
