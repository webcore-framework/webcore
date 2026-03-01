import Application from "../../Application/Application.js";

export default class ECDH {
    constructor(secureMode=true){
        Object.freezeProp(this, "secureMode", secureMode);
        Object.freezeProp(this, "curve", "P-256");
        Object.freezeProp(this, "length", 256);

        if (secureMode){
            // 创建密钥
            Object.freezeProp(this, "generateKey", async function generateKey(){
                try {

                    const keys = Object.pure({name: "ECDH"});
                    const keygen = await crypto.subtle.generateKey(
                        { name: "ECDH", namedCurve: "P-256"},
                        true,
                        ["deriveKey", "deriveBits"]
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


            // 导入对方公钥
            Object.freezeProp(this, "importKey", async function importKey(publicKey){
                Error.throwIfNull(publicKey, "Public key");
                if (publicKey instanceof Uint8Array || publicKey instanceof ArrayBuffer){
                    return await window.crypto.subtle.importKey(
                        "spki",
                        publicKey.buffer,
                        { name: "ECDH", namedCurve: "P-256" },
                        false,
                        []
                    );
                } else if (typeof publicKey === "string"){
                    const buffer = Application.instance.text.encoding.base64ToArrayBuffer(publicKey);
                    return await window.crypto.subtle.importKey(
                        "spki",
                        buffer,
                        { name: "ECDH", namedCurve: "P-256" },
                        false,
                        []
                    );
                } else {
                    throw new TypeError("Invalid public key.");
                }
            });

            // 计算共享密钥
            Object.freezeProp(this, "getSharedSecret", async function getSharedSecret(privateKey, publicKey) {
                try {
                    Error.throwIfNull(privateKey, "Private key");
                    if (!(privateKey instanceof CryptoKey)) {throw new TypeError("Invalid private key: must be a CryptoKey.")}

                    Error.throwIfNull(publicKey, "Public key");
                    if (!(publicKey instanceof CryptoKey)) {throw new TypeError("Invalid public key: must be a CryptoKey.")}

                    return await crypto.subtle.deriveBits(
                        {
                            name: "ECDH",
                            public: publicKey,
                        },
                        privateKey,
                        256
                    );

                } catch {
                    throw new Error("Derive failed.");
                }
            });

            // 派生 AES 共享密钥
            Object.freezeProp(this, "getSecretKey", async function getSecretKey(privateKey, publicKey) {
                try {
                    Error.throwIfNull(privateKey, "Private key");
                    if (!(privateKey instanceof CryptoKey)) {throw new TypeError("Invalid private key: must be a CryptoKey.")}
                    Error.throwIfNull(publicKey, "Public key");
                    if (!(publicKey instanceof CryptoKey)) {throw new TypeError("Invalid public key: must be a CryptoKey.")}

                    return await crypto.subtle.deriveKey(
                        {
                            name: "ECDH",
                            public: publicKey,
                            hash: "SHA-256",
                        },
                        privateKey,
                        {
                            name: "AES-GCM",
                            length: 256,
                        },
                        false,
                        ["encrypt", "decrypt"]
                    );

                } catch {
                    throw new Error("Derive failed.");
                }
            });

        } else {
            import("../lib/P256.js").then(module=>{
                Object.freezeProp(ECDH, "p256", module.default);
            });

            // 创建密钥
            Object.freezeProp(this, "generateKey", async function generateKey(){
                try {
                    const keys = Object.pure({name: "ECDH"});
                    const keygen = ECDH.p256.keygen();
                    keys.keygen = Object.pure({privateKey: keygen.secretKey, publicKey: keygen.publicKey});

                    keys.publicKeyBase64 = Application.instance.text.encoding.bytesToBase64(keygen.publicKey);
                    keys.privateKeyBase64 = Application.instance.text.encoding.bytesToBase64(keygen.secretKey);
                    return keys;
                } catch {
                    throw new Error("Failed to generate key.");
                }
            });

            // 导入密钥
            Object.freezeProp(this, "importKey", async function importKey(publicKey){
                Error.throwIfNull(publicKey, "Public key");
                if (publicKey instanceof Uint8Array){
                    return publicKey
                } else if (publicKey instanceof ArrayBuffer){
                    return new Uint8Array(publicKey)
                } else if (typeof publicKey === "string"){
                    return Application.instance.text.encoding.base64ToBytes(publicKey)
                } else {
                    throw new TypeError("Invalid public key.");
                }
            });

            // 计算共享密钥
            Object.freezeProp(this, "getSharedSecret", async function getSharedSecret(privateKey, publicKey) {
                Error.throwIfNull(privateKey, "Private key");
                if (typeof privateKey === "string"){
                    privateKey = Application.instance.text.encoding.base64ToBytes(privateKey)
                } else if (!(privateKey instanceof Uint8Array)) {
                    throw new TypeError("Invalid private key: must be a Uint8Array.")
                }

                Error.throwIfNull(publicKey, "Public key");
                if (typeof publicKey === "string"){
                    publicKey = Application.instance.text.encoding.base64ToBytes(publicKey)
                } else if (!(publicKey instanceof Uint8Array)) {
                    throw new TypeError("Invalid public key: must be a Uint8Array.")
                }

                return ECDH.p256.getSharedSecret(privateKey, publicKey);
            });
        }
    }
}
