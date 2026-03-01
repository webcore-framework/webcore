import Application from "../../Application/Application.js";

// 从用户密码派生出加密密钥
export default class PBKDF2 {
    constructor(secureMode=true){
        Object.freezeProp(this, "secureMode", secureMode);
        Object.freezeProp(PBKDF2, "encoder", new TextEncoder());

        // 生成随机盐
        Object.freezeProp(this, "generateSalt", function generateSalt(length = 16) {
            return crypto.getRandomValues(new Uint8Array(length));
        });

        if (secureMode){
            // 密钥派生
            Object.freezeProp(this, "deriveKey", async function deriveKey(password, salt) {
                Error.throwIfWhiteSpace(password, "Password");
                const cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    PBKDF2.encoder.encode(password),
                    { name: 'PBKDF2' },
                    false,
                    ['deriveKey', 'deriveBits']
                );
                if (salt){
                    if (typeof salt === "string"){
                        salt = PBKDF2.encoder.encode(salt);
                    } else {
                        Error.throwIfNotBytes(salt, "Salt");
                    }
                }
                const derivedKey = await crypto.subtle.deriveKey(
                    {
                        name: 'PBKDF2',
                        salt: salt,
                        iterations: 100000,
                        hash: 'SHA-256',
                    },
                    cryptoKey,
                    { name: 'AES-GCM', length: 256 },
                    true,
                    ['encrypt', 'decrypt'],
                );

                const exportedKey = await crypto.subtle.exportKey('raw', derivedKey);

                return Object.pure({
                    key: Application.instance.text.encoding.arrayBufferToHex(exportedKey),
                    salt: Application.instance.text.encoding.bytesToHex(salt),
                });
            });


        } else {

        }
    }
}
