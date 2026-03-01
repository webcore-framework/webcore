export default class SHA256 {
    constructor(secureMode=true){
        Object.freezeProp(SHA256, "encoder", new TextEncoder());
        Object.freezeProp(this, "secureMode", secureMode);

        if (secureMode){
            Object.freezeProp(this, "hash", async function hash(bytes) {
                Error.throwIfNotBytes(bytes, "Bytes");
                return await crypto.subtle.digest('SHA-256', bytes);
            });

            Object.freezeProp(this, "fromStringToBytes", async function fromStringToBytes(text) {
                Error.throwIfNotString(text, "Text");
                const bytes = SHA256.encoder.encode(text);
                return await crypto.subtle.digest('SHA-256', bytes);
            });

            Object.freezeProp(this, "fromStringToHex", async function fromStringToHex(text) {
                Error.throwIfNotString(text, "Text");
                const bytes = SHA256.encoder.encode(text);
                const buffer = await crypto.subtle.digest('SHA-256', bytes);
                return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, "0")).join("");
            });

            Object.freezeProp(this, "fromBytesToHex", async function fromBytesToHex(bytes) {
                Error.throwIfNotBytes(bytes, "Bytes");
                const buffer = await crypto.subtle.digest('SHA-256', bytes);
                return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, "0")).join("");
            });
        } else {
            import("../lib/SHA256.js").then(module=>{
                Object.freezeProp(SHA256, "sha256", module.default);

                Object.freezeProp(this, "hash", async function hash(bytes){
                    Error.throwIfNotBytes(bytes, "Bytes");
                    return SHA256.sha256(bytes);
                });

                Object.freezeProp(this, "fromStringToBytes", async function fromStringToBytes(text){
                    Error.throwIfNotString(text, "Text");
                    const bytes = SHA256.encoder.encode(text);
                    return SHA256.sha256(bytes)
                });

                Object.freezeProp(this, "fromStringToHex", async function fromStringToHex(text){
                    Error.throwIfNotString(text, "Text");
                    const bytes = SHA256.encoder.encode(text);
                    return Array.from(SHA256.sha256(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
                });

                Object.freezeProp(this, "fromBytesToHex", async function fromBytesToHex(bytes){
                    Error.throwIfNotBytes(bytes, "Bytes");
                    return Array.from(SHA256.sha256(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
                });
            });
        }

    }
}
