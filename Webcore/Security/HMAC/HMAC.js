import Application from "../../Application/Application.js";
import secureCompare from "../SecureCompare.js";

// 消息认证
export default class HMAC {
    constructor(secureMode=true){
        Object.freezeProp(this, "secureMode", secureMode);
        Object.freezeProp(this, "hash", "HMAC");
        Object.freezeProp(this, "name", "SHA-256");
        Object.freezeProp(this, "length", 256);

        Object.freezeProp(HMAC, "encoder", new TextEncoder());

        if (secureMode){
            Object.freezeProp(this, "sign", async function sign(key, message) {
                Error.throwIfNotBytes(key, "Key");
                const cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    key,
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['sign']
                );

                const signature = await crypto.subtle.sign(
                    'HMAC',
                    cryptoKey,
                    HMAC.encode(message)
                );

                return Application.instance.text.encoding.arrayBufferToHex(signature);
            });


            Object.freezeProp(this, "verify", async function verify(key, message, sign) {
                Error.throwIfNotBytes(key, "Key");
                const cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    key,
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['verify']
                );
                return await crypto.subtle.verify(
                    'HMAC',
                    cryptoKey,
                    Application.instance.text.encoding.hexToBytes(sign),
                    HMAC.encode(message)
                );
            });


        } else {
            import("../lib/HMAC.js").then(module=>{Object.freezeProp(HMAC, "derive", module.hmac)});
            import("../lib/SHA256.js").then(module=>{Object.freezeProp(HMAC, "sha256", module.default)});

            Object.freezeProp(this, "sign", async function sign(key, message) {
                Error.throwIfNotBytes(key, "Key");
                return Application.instance.text.encoding.bytesToHex(HMAC.derive(HMAC.sha256, key, HMAC.encoder.encode(message)));
            });

            Object.freezeProp(this, "verify", async function verify(key, message, sign) {
                Error.throwIfNotBytes(key, "Key");
                const signature = this.sign(key, message);
                return secureCompare.compare(message, signature);
            });
        }
    }
}
