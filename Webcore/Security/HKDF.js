import Application from "../Application/Application.js";

export default class HKDF {
    constructor(){
        import("./lib/HKDF.js").then(module=>{
            Object.freezeProp(HKDF, "derive", module.default)
        });
        import("./lib/SHA256.js").then(module=>{
            Object.freezeProp(HKDF, "sha256", module.default)
        });
        Object.freezeProp(HKDF, "encoder", new TextEncoder());

        Object.freezeProp(this, "deriveKey", function deriveKey(key, salt, info){
            if (salt){
                if (typeof salt === "string"){
                    salt = Application.instance.text.encoding.base64Tobytes(salt)
                } else if (!(salt instanceof Uint8Array)){
                    throw new TypeError("Salt must be of Uint8Array type.")
                }
            }
            if (info){
                if (typeof info === "string"){
                    salt = Application.instance.text.encoding.base64Tobytes(info)
                } else if (!(info instanceof Uint8Array)){
                    throw new TypeError("Info must be of Uint8Array type.")
                }
            }
            const secretKey = HKDF.derive(HKDF.sha256, key, salt, info, 32);
            return Object.pure({
                secretKey: secretKey,
                secretKeyBase64: Application.instance.text.encoding.bytesToBase64(secretKey)
            });
        });
    }

}
