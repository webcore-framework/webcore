import Application from "../../Application/Application.js";

// 密钥派生
export default class HKDF {
    constructor(secureMode=true){
        Object.freezeProp(this, "secureMode", secureMode);
        Object.freezeProp(this, "hash", "HKDF");
        Object.freezeProp(this, "name", "SHA-256");
        Object.freezeProp(this, "length", 256);

        Object.freezeProp(HKDF, "encoder", new TextEncoder());

        if (secureMode){
            Object.freezeProp(this, "deriveKey", async function deriveKey(key, salt, info) {
                Error.throwIfNull(key, "Key");
                const cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    key,
                    'HKDF',
                    false,
                    ['deriveKey']
                );

                if (typeof salt === "string"){
                    salt = Application.instance.text.encoding.base64ToArrayBuffer(salt)
                } else if (salt instanceof Uint8Array) {
                    salt = salt.buffer;
                } else if (!(salt instanceof ArrayBuffer)){
                    salt = new ArrayBuffer(0);
                }

                if (typeof info === "string"){
                    info = Application.instance.text.encoding.base64ToArrayBuffer(info)
                } else if (info instanceof Uint8Array) {
                    info = info.buffer;
                } else if (!(info instanceof ArrayBuffer)){
                    info = new ArrayBuffer(0);
                }

                // 派生 256 位密钥
                return await crypto.subtle.deriveKey(
                    {
                        name: 'HKDF',
                        hash: 'SHA-256',
                        salt: salt,
                        info: info
                    },
                    cryptoKey,
                    { name: 'AES-GCM', length: 256 },
                    false,
                    ['encrypt', 'decrypt']
                );
            });

        } else {
            import("../lib/HMAC.js").then(module=>{Object.freezeProp(HKDF, "derive", module.hkdf)});
            import("../lib/SHA256.js").then(module=>{Object.freezeProp(HKDF, "sha256", module.default)});

            Object.freezeProp(this, "deriveKey", async function deriveKey(key, salt, info){
                Error.throwIfNotBytes(key, "Key");

                if (typeof salt === "string"){
                    salt = Application.instance.text.encoding.base64Tobytes(salt)
                } else if (!(salt instanceof Uint8Array)){
                    salt = new Uint8Array(0);
                }

                if (typeof info === "string"){
                    info = Application.instance.text.encoding.base64Tobytes(info)
                } else if (!(info instanceof Uint8Array)){
                    info = new Uint8Array(0);
                }

                return HKDF.derive(HKDF.sha256, key, salt, info, 32);
            });
        }
    }
}
