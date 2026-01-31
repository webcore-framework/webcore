import Generate from "./Generate.js";
// import Crypto from "./Crypto.js";
// import Hash from "./Hash.js";
import SHA256 from "./SHA256.js"
import CryptoAES from "./CryptoAES.js";
import CryptoRSA from "./CryptoRSA.js";
import PBKDF2 from "./PBKDF2.js";
import CryptoECC from "./CryptoECC.js"
import AES_GCM from "./lib/AESGCM.js";
import HKDF from "./HKDF.js";
import SecretSession from "./SecretSession.js";

export default class SecurityService {
    static #instance = null;

    static singleton = true;
    static serviceName = "security";

    constructor(){
        if (SecurityService.#instance){return SecurityService.#instance;}
        Object.freezeProp(this, "secureMode", Boolean(crypto.subtle && window.isSecureContext));
        Object.freezeProp(this, "generate", new Generate());
        Object.freezeProp(this, "sha256", new SHA256());
        Object.freezeProp(this, "rsa", new CryptoRSA());
        Object.freezeProp(this, "ecc", new CryptoECC());
        Object.freezeProp(this, "aes", new CryptoAES());
        Object.freezeProp(this, "aesgcm", AES_GCM);
        // Object.freezeProp(this, "hash", new Hash());
        Object.freezeProp(this, "pbkdf2", new PBKDF2());
        Object.freezeProp(this, "hkdf", new HKDF());
        Object.freezeProp(this, "secretSession", new SecretSession(this));
        // Object.sealProp(this, "crypto", null)
        SecurityService.#instance = this;
    }
}
