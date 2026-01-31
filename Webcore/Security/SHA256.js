export default class SHA256 {
    constructor(){
        import("./lib/SHA256.js").then(module=>{
            Object.freezeProp(SHA256, "sha256", module.default)
        });
        Object.freezeProp(SHA256, "encoder", new TextEncoder());
    }

    hash(bytes){
        return SHA256.sha256(bytes)
    }

    fromStringToBytes(str){
        const bytes = SHA256.encoder.encode(str);
        return SHA256.sha256(bytes)
    }

    fromStringToHex(str){
        const bytes = SHA256.encoder.encode(str);
        return Array.from(SHA256.sha256(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
    }

    fromBytesToHex(bytes){
        return Array.from(SHA256.sha256(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
    }
}
